#!/usr/bin/env python3
"""
CLI de generacion de contenido para Sami by Organnical.

Uso:
  python generate.py --type meditacion --tema "ansiedad nocturna" --duracion 10
  python generate.py --publish meditacion-ansiedad-nocturna
"""
import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
import anthropic

# Cargar .env.local del proyecto raiz
load_dotenv(Path(__file__).parent.parent / ".env.local")

OUTPUTS_DIR = Path(__file__).parent / "outputs"
DRAFTS_DIR = OUTPUTS_DIR / "drafts"


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[\xe1\xe0\xe4]', 'a', text)
    text = re.sub(r'[\xe9\xe8\xeb]', 'e', text)
    text = re.sub(r'[\xed\xec\xef]', 'i', text)
    text = re.sub(r'[\xf3\xf2\xf6]', 'o', text)
    text = re.sub(r'[\xfa\xf9\xfc]', 'u', text)
    text = re.sub(r'\xf1', 'n', text)
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'\s+', '-', text.strip())
    return text[:60]


def load_prompt(name: str) -> str:
    prompt_path = Path(__file__).parent / "agents" / f"{name}.md"
    return prompt_path.read_text(encoding="utf-8")


def generate_script(tipo: str, tema: str, duracion_min: int) -> dict:
    """Llama a Claude para generar el guion."""
    client = anthropic.Anthropic()
    script_prompt = load_prompt("script_writer")
    quality_prompt = load_prompt("quality_checker")

    print(f"  Generando guion ({tipo}, {duracion_min} min, tema: {tema})...")

    user_message = f"""
Genera contenido de tipo: {tipo}
Tema/titulo sugerido: {tema}
Duracion objetivo: {duracion_min} minutos

Recuerda devolver UNICAMENTE el JSON especificado, sin markdown ni texto adicional.
"""

    # Paso 1: Generar guion
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        system=script_prompt,
        messages=[{"role": "user", "content": user_message}],
    )

    raw = response.content[0].text
    # Extrae JSON robusto a posible markdown fence
    start = raw.find("{")
    end = raw.rfind("}") + 1
    if start == -1:
        raise ValueError(f"Claude no devolvio JSON valido:\n{raw}")
    draft = json.loads(raw[start:end])

    # Paso 2: Revisar calidad
    print("  Revisando calidad...")
    review_response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        system=quality_prompt,
        messages=[{
            "role": "user",
            "content": f"Revisa este guion:\n\n{json.dumps(draft, ensure_ascii=False, indent=2)}"
        }],
    )

    raw_review = review_response.content[0].text
    r_start = raw_review.find("{")
    r_end = raw_review.rfind("}") + 1
    if r_start == -1:
        raise ValueError(f"El revisor no devolvio JSON valido:\n{raw_review}")
    review = json.loads(raw_review[r_start:r_end])

    if not review["aprobado"]:
        print(f"  Guion rechazado (puntuacion: {review['puntuacion']}/10)")
        for problema in review.get("problemas", []):
            print(f"   - {problema}")
        if review.get("guion_corregido"):
            print("  Aplicando correcciones del revisor...")
            draft["guion"] = review["guion_corregido"]
        else:
            print("  El guion fue rechazado sin correccion automatica.")
            sys.exit(1)
    else:
        print(f"  Guion aprobado (puntuacion: {review['puntuacion']}/10)")

    draft["tipo"] = tipo
    draft["tema"] = tema
    return draft


def cmd_generate(args: argparse.Namespace) -> None:
    """Genera guion + audio y guarda draft localmente."""
    from tts.google_tts import text_to_speech

    draft = generate_script(args.type, args.tema, args.duracion)
    slug = slugify(f"{args.type}-{draft['titulo']}")
    draft["slug"] = slug
    draft["voz"] = args.voz

    # Guardar draft JSON
    DRAFTS_DIR.mkdir(parents=True, exist_ok=True)
    draft_path = DRAFTS_DIR / f"{slug}.json"
    draft_path.write_text(json.dumps(draft, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"  Draft guardado: {draft_path}")

    # Generar audio
    audio_path = OUTPUTS_DIR / "audio" / f"{slug}.mp3"
    print(f"  Generando audio con {args.voz}...")
    text_to_speech(draft["guion"], audio_path, voice_name=args.voz)
    draft["audio_path"] = str(audio_path)
    draft_path.write_text(json.dumps(draft, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\n  Listo! Revisa el draft:")
    print(f"   JSON:  {draft_path}")
    print(f"   Audio: {audio_path}")
    print(f"\nPara publicar: python generate.py --publish {slug}")


def cmd_publish(args: argparse.Namespace) -> None:
    """Sube el draft aprobado a Supabase."""
    from uploader import upload_audio, insert_content, publish_content

    slug = args.publish
    draft_path = DRAFTS_DIR / f"{slug}.json"

    if not draft_path.exists():
        print(f"  Draft no encontrado: {draft_path}")
        sys.exit(1)

    draft = json.loads(draft_path.read_text(encoding="utf-8"))
    audio_path = Path(draft.get("audio_path", ""))

    if not audio_path.exists():
        print(f"  Audio no encontrado: {audio_path}")
        sys.exit(1)

    print(f"  Subiendo audio a Supabase Storage...")
    audio_url = upload_audio(slug, audio_path)

    print(f"  Insertando en sami.content...")
    result = insert_content(draft, audio_url, published=True)

    print(f"\n  Publicado: {draft['titulo']}")
    print(f"   URL: {audio_url}")
    print(f"   ID: {result.get('id', 'N/A')}")


def check_api_key() -> None:
    import os
    if not os.getenv("ANTHROPIC_API_KEY"):
        print(
            "\n  ERROR: ANTHROPIC_API_KEY no encontrada.\n"
            "  Agregala a tu archivo .env.local:\n"
            "  ANTHROPIC_API_KEY=sk-ant-...\n",
            file=sys.stderr,
        )
        sys.exit(1)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generador de contenido Sami by Organnical",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )

    parser.add_argument("--type", choices=["meditacion", "cuento", "ruido", "respiracion"])
    parser.add_argument("--tema", type=str)
    parser.add_argument("--duracion", type=int, default=10, help="Duracion en minutos")
    parser.add_argument("--voz", default="es-PE-Neural2-A", help="Nombre de voz Google TTS")
    parser.add_argument("--publish", type=str, help="Slug del draft a publicar")

    args = parser.parse_args()

    if args.publish:
        cmd_publish(args)
    elif args.type and args.tema:
        check_api_key()
        cmd_generate(args)
    else:
        parser.print_help()
        sys.exit(0)


if __name__ == "__main__":
    main()
