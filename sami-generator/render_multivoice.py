#!/usr/bin/env python3
"""
Renderizador multi-voz para Sami.

Parsea guiones con marcadores [VOZ: X] y renderiza cada bloque
con el narrador correspondiente desde narrators.json.

Uso:
  python render_multivoice.py --script scripts/dos-mil-anos-de-manos-en-la-tierra.txt
  python render_multivoice.py --script scripts/mi-cuento.txt --output outputs/audio/mi-cuento.mp3
  python render_multivoice.py --script scripts/mi-cuento.txt --region costa
"""
import argparse
import json
import os
import re
import sys
from pathlib import Path

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env.local")

from elevenlabs.client import ElevenLabs
from elevenlabs import VoiceSettings
from pydub import AudioSegment

from tts.elevenlabs_tts import (
    _coalesce_breaks,
    _BREAK_RE,
    _synth_segment,
    _mix_ambient,
)

NARRATORS_FILE = Path(__file__).parent / "narrators.json"
OUTPUTS_DIR    = Path(__file__).parent / "outputs"

AMBIENT_DBFS: dict[str, float] = {
    "costa":     -24.0,
    "sierra":    -30.0,
    "selva":     -30.0,
    "universal": -30.0,
}

# Speaker labels del guion → narrator IDs en narrators.json
SPEAKER_MAP = {
    "SAMI":        "sami",
    "DON RUFINO":  "abuelo",
    "EL ABUELO":   "abuelo",
    "EL PESCADOR": "pescador",
    "RODRIGO":     "pescador",
    "LUZ":         "mujer-selva",
    "LA MUJER DE LA SELVA": "mujer-selva",
}


def load_narrators() -> dict:
    return json.loads(NARRATORS_FILE.read_text(encoding="utf-8"))


def parse_multivoice(text: str) -> list[dict]:
    """
    Divide el guion en segmentos por marcador [VOZ: X].
    Las acotaciones escénicas *(entre asteriscos)* se eliminan del speaker label.
    """
    parts = re.split(r'\[VOZ:\s*([^\]]+)\]', text)
    segments = []
    i = 1
    while i < len(parts) - 1:
        speaker = re.sub(r'\*[^*]*\*', '', parts[i]).strip()
        block   = parts[i + 1].strip()
        if block:
            segments.append({"speaker": speaker, "text": block})
        i += 2
    return segments


def render(
    segments: list[dict],
    narrators: dict,
    output_path: Path,
    ambient_path: Path | None = None,
    ambient_dbfs: float = -30.0,
) -> Path:
    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        raise ValueError("Falta ELEVENLABS_API_KEY en .env.local")

    client = ElevenLabs(api_key=api_key)
    final  = AudioSegment.empty()
    total  = len(segments)

    for idx, seg in enumerate(segments, 1):
        speaker_key = seg["speaker"].upper()
        narrator_id = SPEAKER_MAP.get(speaker_key)

        if not narrator_id or narrator_id not in narrators:
            print(f"  ⚠ [{idx}/{total}] Speaker desconocido: '{seg['speaker']}' — saltando")
            continue

        narrator = narrators[narrator_id]
        settings = VoiceSettings(
            stability=narrator["stability"],
            similarity_boost=narrator["similarity_boost"],
            style=narrator["style"],
            speed=narrator["speaking_rate"],
        )
        voice_id = narrator["voz_id"]
        nombre   = narrator["nombre_corto"]

        coalesced = _coalesce_breaks(seg["text"])
        parts_    = _BREAK_RE.split(coalesced)

        text_segs  = sum(1 for i, p in enumerate(parts_) if i % 2 == 0 and p.strip())
        silence_s  = sum(float(p) for i, p in enumerate(parts_) if i % 2 == 1)
        print(f"  [{idx}/{total}] {nombre} — {text_segs} segmento(s), {silence_s:.0f}s silencio")

        seg_audio = AudioSegment.empty()
        for i, part in enumerate(parts_):
            if i % 2 == 0:
                stripped = part.strip()
                if stripped:
                    seg_audio += _synth_segment(client, stripped, voice_id, settings)
            else:
                seg_audio += AudioSegment.silent(duration=int(float(part) * 1000))

        final += seg_audio

    if ambient_path and ambient_path.exists():
        print(f"\n  Mezclando con ambient: {ambient_path.name}")
        ambient = AudioSegment.from_file(ambient_path)
        final   = _mix_ambient(final, ambient, ambient_dbfs=ambient_dbfs)
    elif ambient_path:
        print(f"  ⚠ Ambient no encontrado: {ambient_path} — sin mezcla")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    final.export(output_path, format="mp3", bitrate="128k")
    duration_min = len(final) / 60000
    print(f"\n  Audio guardado: {output_path}")
    print(f"    Duración: {duration_min:.1f} min")
    return output_path


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Renderizador multi-voz para Sami",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--script",     required=True,
                        help="Ruta al archivo .txt del guion (relativa a sami-generator/)")
    parser.add_argument("--output",     default=None,
                        help="Ruta de salida del MP3 (default: outputs/audio/<slug>.mp3)")
    parser.add_argument("--region",     default="sierra",
                        choices=["costa", "sierra", "selva", "universal"],
                        help="Región para el ambient (default: sierra)")
    parser.add_argument("--no-ambient", action="store_true",
                        help="Renderizar sin mezclar ambient")
    args = parser.parse_args()

    script_path = Path(args.script)
    if not script_path.is_absolute():
        script_path = Path(__file__).parent / script_path
    if not script_path.exists():
        print(f"  Script no encontrado: {script_path}")
        sys.exit(1)

    slug        = script_path.stem
    output_path = Path(args.output) if args.output else OUTPUTS_DIR / "audio" / f"{slug}.mp3"

    narrators = load_narrators()
    segments  = parse_multivoice(script_path.read_text(encoding="utf-8"))

    print(f"  Script:  {script_path.name}")
    print(f"  Bloques: {len(segments)}")
    print(f"  Salida:  {output_path}\n")

    ambient_path = None if args.no_ambient else (
        Path(__file__).parent / "ambient" / f"{args.region}.mp3"
    )

    render(
        segments, narrators, output_path,
        ambient_path=ambient_path,
        ambient_dbfs=AMBIENT_DBFS[args.region],
    )


if __name__ == "__main__":
    main()
