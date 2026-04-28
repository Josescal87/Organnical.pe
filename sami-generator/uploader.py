"""Sube MP3 a Supabase Storage e inserta metadata en sami.content."""
import os
import json
from pathlib import Path
from supabase import create_client, Client


def get_supabase() -> Client:
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SECRET_KEY")
    if not url or not key:
        raise ValueError("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY")
    return create_client(url, key)


def upload_audio(slug: str, audio_path: Path) -> str:
    """Sube MP3 al bucket sami-audio y devuelve la URL pública."""
    supabase = get_supabase()

    with open(audio_path, "rb") as f:
        audio_bytes = f.read()

    file_name = f"{slug}.mp3"

    # Upsert — si ya existe, lo reemplaza
    supabase.storage.from_("sami-audio").upload(
        file_name,
        audio_bytes,
        {"content-type": "audio/mpeg", "upsert": True},
    )

    # Construir URL pública
    url_response = supabase.storage.from_("sami-audio").get_public_url(file_name)
    return url_response


def insert_content(draft: dict, audio_url: str, published: bool = False) -> dict:
    """Inserta o actualiza el contenido en sami.content."""
    supabase = get_supabase()

    data = {
        "slug": draft["slug"],
        "title": draft["titulo"],
        "description": draft["descripcion"],
        "category": draft["tipo"],
        "region": draft.get("region", "universal"),
        "duration_seconds": draft["duracion_estimada_segundos"],
        "audio_url": audio_url,
        "tags": draft.get("tags", []),
        "script_text": draft["guion"],
        "tts_voice": draft.get("voz", "es-PE-Neural2-A"),
        "is_published": published,
    }

    result = supabase.schema("sami").table("content").upsert(data).execute()
    return result.data[0] if result.data else {}


def publish_content(slug: str) -> bool:
    """Marca un contenido como publicado."""
    supabase = get_supabase()
    result = (
        supabase.schema("sami")
        .table("content")
        .update({"is_published": True})
        .eq("slug", slug)
        .execute()
    )
    return bool(result.data)
