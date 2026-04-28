"""ElevenLabs TTS para Sami — voces naturales en español."""
import os
from pathlib import Path
from elevenlabs.client import ElevenLabs
from elevenlabs import VoiceSettings


def text_to_speech(
    text: str,
    output_path: Path,
    voice_id: str = "",
    stability: float = 0.55,
    similarity_boost: float = 0.80,
    style: float = 0.20,
    speaking_rate: float = 0.85,
) -> Path:
    """
    Convierte texto a MP3 usando ElevenLabs.

    voice_id: ID de la voz en ElevenLabs (ver Voice Library)
    stability: 0-1, más alto = más consistente, menos expresivo
    similarity_boost: 0-1, fidelidad a la voz original
    style: 0-1, expresividad (para meditación mantener bajo ~0.2)
    speaking_rate: velocidad (0.7 = lento y sereno para meditación)
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

    audio = client.text_to_speech.convert(
        voice_id=voice_id,
        text=text,
        model_id="eleven_multilingual_v2",
        voice_settings=VoiceSettings(
            stability=stability,
            similarity_boost=similarity_boost,
            style=style,
            speed=speaking_rate,
        ),
        output_format="mp3_44100_128",
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "wb") as f:
        for chunk in audio:
            f.write(chunk)

    return output_path
