"""ElevenLabs TTS para Sami — voces naturales en español.

Las pausas se manejan en post-procesamiento: el guión se splitea por tags SSML
`<break time="X.Xs" />`, cada segmento de texto se sintetiza con ElevenLabs por
separado, y los silencios se insertan con pydub. Esto garantiza que las pausas se
respeten exactamente, en lugar de depender del soporte SSML del modelo (el cual es
inconsistente en `eleven_multilingual_v2`).

Si se provee `ambient_path`, se mezcla un track ambiente (loopeado con crossfade,
normalizado a -30 dBFS, con fade-in/out) por debajo de la voz.
"""
import os
import re
from io import BytesIO
from pathlib import Path
from typing import Optional
from elevenlabs.client import ElevenLabs
from elevenlabs import VoiceSettings
from pydub import AudioSegment


_BREAK_RE = re.compile(r'<break\s+time="([\d\.]+)s"\s*/>')


def _coalesce_breaks(text: str) -> str:
    """Junta dos o más <break> consecutivos en uno solo con tiempo sumado.

    Ejemplo: '<break time="3.0s" /><break time="3.0s" />' → '<break time="6.0s" />'
    """
    chain = re.compile(r'(?:<break\s+time="[\d\.]+s"\s*/>\s*){2,}')

    def _merge(match: re.Match) -> str:
        times = [float(t) for t in _BREAK_RE.findall(match.group(0))]
        return f'<break time="{sum(times):.1f}s" />'

    return chain.sub(_merge, text)


def _normalize_loudness(segment: AudioSegment, target_dbfs: float = -18.0) -> AudioSegment:
    """Lleva el segmento a un dBFS promedio objetivo.

    -18 dBFS es un buen target para contenido hablado (cómodo para escuchar
    sin distorsión y consistente entre segmentos).
    """
    if segment.dBFS == float("-inf"):
        return segment  # segmento de silencio, no normalizar
    delta = target_dbfs - segment.dBFS
    return segment.apply_gain(delta)


def _crossfade_loop(ambient: AudioSegment, target_ms: int,
                    crossfade_ms: int = 5000) -> AudioSegment:
    """Loopea el ambient con crossfade hasta cubrir target_ms."""
    if len(ambient) >= target_ms:
        return ambient[:target_ms]
    crossfade_ms = min(crossfade_ms, len(ambient) // 4)
    result = ambient
    while len(result) < target_ms:
        result = result.append(ambient, crossfade=crossfade_ms)
    return result[:target_ms]


def _mix_ambient(voice: AudioSegment, ambient: AudioSegment,
                 ambient_dbfs: float = -30.0,
                 prelude_ms: int = 2000,
                 outro_ms: int = 5000,
                 fade_in_ms: int = 3000,
                 fade_out_ms: int = 6000) -> AudioSegment:
    """Mezcla voz + ambient. Voz a -18 dBFS, ambient a -30 dBFS = ~12 dB por debajo.

    El track final dura prelude + voz + outro. El ambient se loopea con crossfade
    para cubrir todo, hace fade-in al inicio y fade-out al final.
    """
    ambient = _normalize_loudness(ambient, target_dbfs=ambient_dbfs)
    total_ms = prelude_ms + len(voice) + outro_ms
    ambient_track = _crossfade_loop(ambient, total_ms)
    ambient_track = ambient_track.fade_in(fade_in_ms).fade_out(fade_out_ms)

    canvas = AudioSegment.silent(duration=total_ms)
    canvas = canvas.overlay(voice, position=prelude_ms)
    return canvas.overlay(ambient_track)


def _synth_segment(client: ElevenLabs, text: str, voice_id: str,
                   voice_settings: VoiceSettings) -> AudioSegment:
    """Sintetiza un segmento de texto y retorna AudioSegment normalizado."""
    audio_iter = client.text_to_speech.convert(
        voice_id=voice_id,
        text=text,
        model_id="eleven_multilingual_v2",
        voice_settings=voice_settings,
        output_format="mp3_44100_128",
    )
    buffer = BytesIO()
    for chunk in audio_iter:
        buffer.write(chunk)
    buffer.seek(0)
    segment = AudioSegment.from_file(buffer, format="mp3")
    return _normalize_loudness(segment)


def text_to_speech(
    text: str,
    output_path: Path,
    voice_id: str = "",
    stability: float = 0.60,
    similarity_boost: float = 0.80,
    style: float = 0.15,
    speaking_rate: float = 0.80,
    ambient_path: Optional[Path] = None,
    ambient_dbfs: float = -30.0,
) -> Path:
    """
    Convierte texto a MP3 usando ElevenLabs, respetando tags SSML <break>.

    El texto puede contener `<break time="X.Xs" />` para insertar silencios reales.
    Adyacentes se combinan, p. ej. `<break time="3s"/><break time="3s"/>` = 6s.

    voice_id: ID de la voz en ElevenLabs (ver Voice Library)
    stability: 0-1, más alto = más consistente, menos expresivo
    similarity_boost: 0-1, fidelidad a la voz original
    style: 0-1, expresividad (para meditación mantener bajo ~0.15)
    speaking_rate: velocidad (0.7-0.85 para meditación; <0.7 suena artificial)
    """
    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        raise ValueError("Falta ELEVENLABS_API_KEY en .env.local")

    if not voice_id:
        voice_id = os.environ.get("ELEVENLABS_VOICE_ID", "")
    if not voice_id:
        raise ValueError(
            "Falta voice_id. Pásalo como argumento o define ELEVENLABS_VOICE_ID en .env.local"
        )

    client = ElevenLabs(api_key=api_key)
    settings = VoiceSettings(
        stability=stability,
        similarity_boost=similarity_boost,
        style=style,
        speed=speaking_rate,
    )

    # Junta breaks adyacentes y splitea por break.
    coalesced = _coalesce_breaks(text)
    parts = _BREAK_RE.split(coalesced)
    # parts alterna: [texto, duración_str, texto, duración_str, ..., texto]

    text_segments = sum(1 for i, p in enumerate(parts) if i % 2 == 0 and p.strip())
    break_count = (len(parts) - 1) // 2
    total_silence = sum(float(p) for i, p in enumerate(parts) if i % 2 == 1)
    print(f"    {text_segments} segmento(s) de texto + {break_count} pausa(s) = "
          f"{total_silence:.0f}s de silencio insertado")

    final = AudioSegment.empty()
    for i, part in enumerate(parts):
        if i % 2 == 0:
            stripped = part.strip()
            if stripped:
                final += _synth_segment(client, stripped, voice_id, settings)
        else:
            silence_ms = int(float(part) * 1000)
            final += AudioSegment.silent(duration=silence_ms)

    if ambient_path is not None and ambient_path.exists():
        print(f"    Mezclando con ambient: {ambient_path.name}")
        ambient = AudioSegment.from_file(ambient_path)
        final = _mix_ambient(final, ambient, ambient_dbfs=ambient_dbfs)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    final.export(output_path, format="mp3", bitrate="128k")

    return output_path
