#!/usr/bin/env python3
"""
CLI de generacion de contenido para Sami by Organnical.

Uso:
  python generate.py --type meditacion --tema "ansiedad nocturna" --duracion 10
  python generate.py --type cuento --tema "la llama del cielo" --region sierra
  python generate.py --publish meditacion-ansiedad-nocturna
"""
import argparse
import json
import re
import sys
from pathlib import Path
from dotenv import load_dotenv
import anthropic

# Cargar .env.local del proyecto raiz
load_dotenv(Path(__file__).parent.parent / ".env.local")

OUTPUTS_DIR = Path(__file__).parent / "outputs"
DRAFTS_DIR = OUTPUTS_DIR / "drafts"

# Volumen del ambient por región (dBFS). La voz va a -18 dBFS.
# Valores más altos = más fuerte (ej. -24 suena ~6 dB más que -30).
AMBIENT_DBFS: dict[str, float] = {
    "costa":     -24.0,
    "sierra":    -30.0,
    "selva":     -30.0,
    "universal": -30.0,
}

# TTS defaults cuando no hay narrador ni flag CLI explícito
DEFAULT_TTS: dict[str, float] = {
    "stability":        0.60,
    "similarity_boost": 0.80,
    "style":            0.15,
    "speaking_rate":    0.80,
}

# Narrador canónico por región (auto-selección)
REGION_TO_NARRATOR: dict[str, str] = {
    "costa":  "pescador",
    "sierra": "abuelo",
    "selva":  "mujer-selva",
}


def load_narrators() -> dict:
    """Carga el registro de narradores desde narrators.json."""
    p = Path(__file__).parent / "narrators.json"
    if not p.exists():
        return {}
    return json.loads(p.read_text(encoding="utf-8"))


def resolve_tts_params(
    args: argparse.Namespace,
    narrador_config: dict | None,
) -> tuple[str, float, float, float, float]:
    """Resuelve parámetros TTS en orden: CLI flag > narrator config > DEFAULT_TTS."""
    voice_id = args.voz or (narrador_config["voz_id"] if narrador_config else "")
    stability = (
        args.stability if args.stability is not None
        else (narrador_config.get("stability", DEFAULT_TTS["stability"]) if narrador_config else DEFAULT_TTS["stability"])
    )
    similarity_boost = (
        args.similarity_boost if args.similarity_boost is not None
        else (narrador_config.get("similarity_boost", DEFAULT_TTS["similarity_boost"]) if narrador_config else DEFAULT_TTS["similarity_boost"])
    )
    style = (
        args.style if args.style is not None
        else (narrador_config.get("style", DEFAULT_TTS["style"]) if narrador_config else DEFAULT_TTS["style"])
    )
    speaking_rate = (
        args.speaking_rate if args.speaking_rate is not None
        else (narrador_config.get("speaking_rate", DEFAULT_TTS["speaking_rate"]) if narrador_config else DEFAULT_TTS["speaking_rate"])
    )
    return voice_id, stability, similarity_boost, style, speaking_rate


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


# Direcciones escénicas que el LLM podría dejar y que el TTS leería literalmente.
# Mapean a un total de silencio en segundos (se distribuye en tags <break> de hasta 3s).
_STAGE_DIRECTIONS = [
    (r'\(\s*silencio[^)]*\)',              3.0),
    (r'\[\s*silencio[^\]]*\]',             3.0),
    (r'\(\s*pausa[^)]*\)',                 3.0),
    (r'\[\s*pausa[^\]]*\]',                3.0),
    (r'\bpausa\s+(?:muy\s+)?larga\b\.?',   9.0),
    (r'\bpausa\s+prolongada\b\.?',         9.0),
    (r'\bpausa\s+media\b\.?',              5.0),
    (r'\bpausa\s+corta\b\.?',              2.0),
    (r'\bpausa\b\.?',                      3.0),
]


def _seconds_to_breaks(total_seconds: float) -> str:
    """Convierte N segundos en una secuencia de tags <break> (max 3s cada uno)."""
    remaining = total_seconds
    parts = []
    while remaining > 0.0001:
        chunk = min(3.0, remaining)
        parts.append(f'<break time="{chunk:.1f}s" />')
        remaining -= chunk
    return "".join(parts)


def normalize_script_pauses(text: str) -> tuple[str, int]:
    """Convierte direcciones escénicas residuales en tags SSML."""
    replacements = 0
    for pattern, seconds in _STAGE_DIRECTIONS:
        breaks = _seconds_to_breaks(seconds)

        def _replace(_match: re.Match) -> str:
            nonlocal replacements
            replacements += 1
            return breaks

        text = re.sub(pattern, _replace, text, flags=re.IGNORECASE)
    return text, replacements


def load_prompt(name: str) -> str:
    prompt_path = Path(__file__).parent / "agents" / f"{name}.md"
    return prompt_path.read_text(encoding="utf-8")


def generate_script(
    tipo: str,
    tema: str,
    duracion_min: int,
    region: str = "universal",
    narrador_id: str | None = None,
) -> dict:
    """Llama a Claude para generar el guion."""
    client = anthropic.Anthropic()
    script_prompt = load_prompt("script_writer")
    quality_prompt = load_prompt("quality_checker")

    narrador_linea = f"\nNarrador: {narrador_id}" if narrador_id else ""
    narrador_log = f", narrador: {narrador_id}" if narrador_id else ""
    print(f"  Generando guion ({tipo}, {duracion_min} min, region: {region}{narrador_log}, tema: {tema})...")

    user_message = f"""
Genera contenido de tipo: {tipo}
Tema/titulo sugerido: {tema}
Duracion objetivo: {duracion_min} minutos
Region cultural: {region}{narrador_linea}

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
            print("⚠️  Aplicando corrección automática. Revisa el draft antes de publicar.")
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
    from tts.elevenlabs_tts import text_to_speech

    # Determinar narrador
    narrators = load_narrators()
    narrador_id = args.narrador

    if not narrador_id and args.region in REGION_TO_NARRATOR:
        narrador_id = REGION_TO_NARRATOR[args.region]
        print(f"  Narrador auto-seleccionado: {narrador_id} (región {args.region})")

    narrador_config = narrators.get(narrador_id) if narrador_id else None

    # Resolver parámetros TTS
    voice_id, stability, similarity_boost, style, speaking_rate = resolve_tts_params(args, narrador_config)

    # Validar voice_id
    if voice_id and voice_id.startswith("PENDIENTE"):
        print(f"\n  ⚠ El Voice ID del narrador '{narrador_id}' no está configurado.")
        print(f"    Edita sami-generator/narrators.json y asigna el Voice ID de ElevenLabs.")
        print(f"    O pasa --voz VOICE_ID para usar una voz diferente.\n")
        sys.exit(1)

    draft = generate_script(args.type, args.tema, args.duracion, args.region, narrador_id)
    slug = slugify(f"{args.type}-{draft['titulo']}")
    draft["slug"] = slug
    draft["voz"] = voice_id
    draft["region"] = args.region
    draft["narrador"] = narrador_id

    # Guardar draft JSON
    DRAFTS_DIR.mkdir(parents=True, exist_ok=True)
    draft_path = DRAFTS_DIR / f"{slug}.json"
    draft_path.write_text(json.dumps(draft, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"  Draft guardado: {draft_path}")

    # Normalizar pausas residuales
    normalized_guion, n_fixed = normalize_script_pauses(draft["guion"])
    if n_fixed > 0:
        print(f"  ⚠ Normalizadas {n_fixed} direccion(es) escénica(s) → tags <break> SSML")
        draft["guion"] = normalized_guion
        draft_path.write_text(json.dumps(draft, ensure_ascii=False, indent=2), encoding="utf-8")

    # Generar audio
    audio_path = OUTPUTS_DIR / "audio" / f"{slug}.mp3"
    ambient_path = Path(__file__).parent / "ambient" / f"{args.region}.mp3"
    if not ambient_path.exists():
        print(f"  ⚠ No hay ambient para región '{args.region}' (esperado: {ambient_path})")
        ambient_path = None

    narrador_label = (
        f"{narrador_id} ({narrador_config['nombre']})" if narrador_config
        else (voice_id or "default")
    )
    print(f"  Generando audio con ElevenLabs — narrador: {narrador_label}...")
    ambient_dbfs = AMBIENT_DBFS.get(args.region, -30.0)
    text_to_speech(draft["guion"], audio_path, voice_id=voice_id,
                   stability=stability, similarity_boost=similarity_boost,
                   style=style, speaking_rate=speaking_rate,
                   ambient_path=ambient_path, ambient_dbfs=ambient_dbfs)
    draft["audio_path"] = str(audio_path)
    draft_path.write_text(json.dumps(draft, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\n  Listo! Revisa el draft:")
    print(f"   JSON:  {draft_path}")
    print(f"   Audio: {audio_path}")
    print(f"\nPara publicar: python generate.py --publish {slug}")


def cmd_retts(args: argparse.Namespace) -> None:
    """Re-genera SOLO el audio de un draft existente (sin re-llamar a Claude)."""
    from tts.elevenlabs_tts import text_to_speech

    slug = args.retts
    draft_path = DRAFTS_DIR / f"{slug}.json"

    if not draft_path.exists():
        print(f"  Draft no encontrado: {draft_path}")
        sys.exit(1)

    draft = json.loads(draft_path.read_text(encoding="utf-8"))
    region = draft.get("region", "universal")

    # Cargar narrador del draft si no se sobreescribe por CLI
    narrators = load_narrators()
    narrador_id = args.narrador or draft.get("narrador")
    narrador_config = narrators.get(narrador_id) if narrador_id else None

    voice_id, stability, similarity_boost, style, speaking_rate = resolve_tts_params(args, narrador_config)
    if not voice_id:
        voice_id = draft.get("voz", "")

    audio_path = OUTPUTS_DIR / "audio" / f"{slug}.mp3"
    ambient_path = Path(__file__).parent / "ambient" / f"{region}.mp3"
    if not ambient_path.exists():
        print(f"  ⚠ No hay ambient para región '{region}' (esperado: {ambient_path})")
        ambient_path = None

    narrador_log = f", narrador={narrador_id}" if narrador_id else ""
    print(f"  Re-generando audio (slug={slug}, región={region}{narrador_log})...")
    ambient_dbfs = AMBIENT_DBFS.get(region, -30.0)
    text_to_speech(draft["guion"], audio_path, voice_id=voice_id,
                   stability=stability, similarity_boost=similarity_boost,
                   style=style, speaking_rate=speaking_rate,
                   ambient_path=ambient_path, ambient_dbfs=ambient_dbfs)
    draft["audio_path"] = str(audio_path)
    draft_path.write_text(json.dumps(draft, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n  Listo: {audio_path}")


def cmd_publish(args: argparse.Namespace) -> None:
    """Sube el draft aprobado a Supabase."""
    from uploader import upload_audio, insert_content

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
    parser.add_argument("--region", choices=["costa", "sierra", "selva", "universal"], default="universal",
                        help="Region cultural del contenido")
    parser.add_argument("--narrador", type=str, default=None,
                        help="ID del narrador (pescador|abuelo|mujer-selva). Auto-seleccionado por región si no se especifica.")
    parser.add_argument("--voz", default="", help="ElevenLabs Voice ID — anula el voice_id del narrador")
    parser.add_argument("--stability", type=float, default=None, help="Consistencia de la voz 0-1 — anula el del narrador")
    parser.add_argument("--similarity-boost", type=float, default=None, dest="similarity_boost", help="Fidelidad a la voz original 0-1")
    parser.add_argument("--style", type=float, default=None, help="Expresividad 0-1")
    parser.add_argument("--speaking-rate", type=float, default=None, dest="speaking_rate", help="Velocidad de habla 0.7-1.0")
    parser.add_argument("--publish", type=str, help="Slug del draft a publicar")
    parser.add_argument("--retts", type=str, help="Slug del draft a re-renderizar (audio only, no re-genera guion)")

    args = parser.parse_args()

    if args.publish:
        cmd_publish(args)
    elif args.retts:
        cmd_retts(args)
    elif args.type and args.tema:
        check_api_key()
        cmd_generate(args)
    else:
        parser.print_help()
        sys.exit(0)


if __name__ == "__main__":
    main()
