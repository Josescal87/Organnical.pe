"""Google Cloud TTS usando la service account existente del proyecto."""
import os
import re
from pathlib import Path
from google.oauth2 import service_account
from google.cloud import texttospeech

MAX_BYTES = 4800


def get_credentials():
    """Construye credenciales desde las env vars del proyecto."""
    service_account_email = os.environ.get("GOOGLE_SERVICE_ACCOUNT_EMAIL")
    private_key = os.environ.get("GOOGLE_PRIVATE_KEY", "").replace("\\n", "\n")

    if not service_account_email or not private_key:
        raise ValueError(
            "Faltan GOOGLE_SERVICE_ACCOUNT_EMAIL o GOOGLE_PRIVATE_KEY en .env.local"
        )

    credentials_info = {
        "type": "service_account",
        "project_id": "organnicalpe",
        "private_key_id": "sami-tts",
        "private_key": private_key,
        "client_email": service_account_email,
        "token_uri": "https://oauth2.googleapis.com/token",
    }

    scopes = ["https://www.googleapis.com/auth/cloud-platform"]
    return service_account.Credentials.from_service_account_info(
        credentials_info, scopes=scopes
    )


def _split_text(text: str) -> list[str]:
    """Divide el texto en fragmentos que caben en el límite de bytes de la API."""
    sentences = re.split(r'(?<=[.!?…\n])\s*', text)
    chunks: list[str] = []
    current = ""
    for sentence in sentences:
        if not sentence.strip():
            continue
        candidate = (current + " " + sentence).strip() if current else sentence
        if len(candidate.encode("utf-8")) <= MAX_BYTES:
            current = candidate
        else:
            if current:
                chunks.append(current)
            current = sentence
    if current:
        chunks.append(current)
    return chunks


def text_to_speech(
    text: str,
    output_path: Path,
    voice_name: str = "es-US-Chirp3-HD-Aoede",
    speaking_rate: float = 0.85,
    pitch: float = -2.0,
) -> Path:
    """
    Convierte texto a MP3 usando Google Cloud TTS.
    Divide automáticamente textos largos en fragmentos y concatena el audio.

    Voces recomendadas (español):
    - es-US-Chirp3-HD-Aoede  (femenina, máxima calidad)
    - es-US-Chirp3-HD-Kore   (femenina)
    - es-US-Neural2-A        (femenina, segunda opción)
    - es-US-Chirp3-HD-Orus   (masculina)
    """
    credentials = get_credentials()
    client = texttospeech.TextToSpeechClient(credentials=credentials)

    voice = texttospeech.VoiceSelectionParams(
        language_code="es-US",
        name=voice_name,
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3,
        speaking_rate=speaking_rate,
        effects_profile_id=["headphone-class-device"],
    )

    chunks = _split_text(text)
    audio_parts: list[bytes] = []

    for i, chunk in enumerate(chunks, 1):
        print(f"    Fragmento {i}/{len(chunks)} ({len(chunk.encode('utf-8'))} bytes)...")
        synthesis_input = texttospeech.SynthesisInput(text=chunk)
        response = client.synthesize_speech(
            input=synthesis_input, voice=voice, audio_config=audio_config
        )
        audio_parts.append(response.audio_content)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "wb") as f:
        for part in audio_parts:
            f.write(part)

    return output_path
