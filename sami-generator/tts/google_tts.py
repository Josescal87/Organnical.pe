"""Google Cloud TTS usando la service account existente del proyecto."""
import os
import json
import base64
from pathlib import Path
from google.oauth2 import service_account
from google.cloud import texttospeech


def get_credentials():
    """Construye credenciales desde las env vars del proyecto."""
    # El proyecto ya tiene estas variables para Google Calendar
    service_account_email = os.environ.get("GOOGLE_SERVICE_ACCOUNT_EMAIL")
    private_key = os.environ.get("GOOGLE_PRIVATE_KEY", "").replace("\\n", "\n")

    if not service_account_email or not private_key:
        raise ValueError(
            "Faltan GOOGLE_SERVICE_ACCOUNT_EMAIL o GOOGLE_PRIVATE_KEY en .env.local"
        )

    credentials_info = {
        "type": "service_account",
        "project_id": "organnical",
        "private_key_id": "sami-tts",
        "private_key": private_key,
        "client_email": service_account_email,
        "token_uri": "https://oauth2.googleapis.com/token",
    }

    scopes = ["https://www.googleapis.com/auth/cloud-platform"]
    return service_account.Credentials.from_service_account_info(
        credentials_info, scopes=scopes
    )


def text_to_speech(
    text: str,
    output_path: Path,
    voice_name: str = "es-PE-Neural2-A",
    speaking_rate: float = 0.85,  # más lento para meditación
    pitch: float = -2.0,          # voz más grave y serena
) -> Path:
    """
    Convierte texto a MP3 usando Google Cloud TTS Neural2.

    Voces disponibles para español peruano:
    - es-PE-Neural2-A (femenina) — recomendada para meditaciones
    - es-PE-Neural2-B (masculina)
    - es-PE-Standard-A/B (más barata, menor calidad)
    """
    credentials = get_credentials()
    client = texttospeech.TextToSpeechClient(credentials=credentials)

    synthesis_input = texttospeech.SynthesisInput(text=text)

    voice = texttospeech.VoiceSelectionParams(
        language_code="es-PE",
        name=voice_name,
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3,
        speaking_rate=speaking_rate,
        pitch=pitch,
        effects_profile_id=["headphone-class-device"],  # optimizado para auriculares
    )

    response = client.synthesize_speech(
        input=synthesis_input, voice=voice, audio_config=audio_config
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "wb") as f:
        f.write(response.audio_content)

    return output_path
