import json
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent.parent
BLOG_TS = PROJECT_ROOT / "lib" / "blog.ts"
OUTPUTS_DIR = Path(__file__).parent.parent / "outputs"
BLOG_DRAFTS_DIR = OUTPUTS_DIR / "blog"
BLOG_APPROVED_DIR = OUTPUTS_DIR / "blog_approved"

REQUIRED_FIELDS = [
    "slug", "title", "excerpt", "date", "dateFormatted",
    "author", "authorRole", "category", "tags", "image", "readTime", "content",
]
VALID_BLOCK_TYPES = {"p", "h2", "h3", "ul", "ol", "quote"}


def validate_against_blogpost_interface(post: dict) -> None:
    """Valida que el dict tenga todos los campos de BlogPost y ContentBlocks válidos."""
    for field in REQUIRED_FIELDS:
        if field not in post:
            raise ValueError(f"Campo obligatorio faltante en draft: '{field}'")

    if not isinstance(post["content"], list) or len(post["content"]) < 8:
        raise ValueError("'content' debe ser una lista con al menos 8 bloques")

    for i, block in enumerate(post["content"]):
        if not isinstance(block, dict) or "type" not in block:
            raise ValueError(f"ContentBlock #{i} inválido: falta campo 'type'")
        if block["type"] not in VALID_BLOCK_TYPES:
            raise ValueError(
                f"ContentBlock #{i} tiene type inválido: '{block['type']}'. "
                f"Válidos: {sorted(VALID_BLOCK_TYPES)}"
            )
        if block["type"] in ("ul", "ol") and "items" not in block:
            raise ValueError(f"ContentBlock #{i} de tipo '{block['type']}' requiere campo 'items'")
        if block["type"] in ("p", "h2", "h3", "quote") and "text" not in block:
            raise ValueError(f"ContentBlock #{i} de tipo '{block['type']}' requiere campo 'text'")

    if not isinstance(post["tags"], list):
        raise ValueError("'tags' debe ser una lista")


def extract_post_json(agent_output: str) -> dict:
    """Extrae y parsea el JSON del output del Content Creator (robusto a markdown fences)."""
    # Intenta extraer JSON de bloque de código markdown primero
    code_block = re.search(r"```(?:json)?\s*(\{[\s\S]+?\})\s*```", agent_output)
    if code_block:
        return json.loads(code_block.group(1))

    # Fallback: busca el JSON más externo en el texto
    start = agent_output.find("{")
    end = agent_output.rfind("}") + 1
    if start == -1 or end == 0:
        raise ValueError("No se encontró JSON válido en el output del Content Creator")
    return json.loads(agent_output[start:end])


def save_draft(agent_output: str) -> Path:
    """
    Paso 1 del flujo Human-in-the-Loop:
    - Extrae el JSON del output del agente
    - Valida contra la interfaz BlogPost
    - Guarda en outputs/blog/draft_[slug].json
    - Formatea con Prettier
    - Crea rama git blog/[slug]
    Devuelve el path del draft guardado.
    """
    post_data = extract_post_json(agent_output)
    validate_against_blogpost_interface(post_data)

    slug = post_data["slug"]
    BLOG_DRAFTS_DIR.mkdir(parents=True, exist_ok=True)
    draft_path = BLOG_DRAFTS_DIR / f"draft_{slug}.json"

    # Quitar media_assets del JSON que se guardará como draft del blog
    # (media_assets es solo para el equipo de diseño, no va en lib/blog.ts)
    draft_clean = {k: v for k, v in post_data.items() if k != "media_assets"}
    draft_path.write_text(json.dumps(draft_clean, ensure_ascii=False, indent=2), encoding="utf-8")

    # Guardar media_assets por separado si existen
    if "media_assets" in post_data:
        media_path = BLOG_DRAFTS_DIR / f"media_assets_{slug}.json"
        media_path.write_text(
            json.dumps(post_data["media_assets"], ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(f"  Media assets guardados en: {media_path.relative_to(PROJECT_ROOT)}")

    # Prettier (no bloquea si falla — Prettier es opcional)
    try:
        subprocess.run(
            ["npx", "prettier", "--write", str(draft_path)],
            cwd=str(PROJECT_ROOT),
            check=True,
            capture_output=True,
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass  # Prettier falla silenciosamente si no está disponible

    # Crear rama git
    try:
        subprocess.run(
            ["git", "checkout", "-b", f"blog/{slug}"],
            cwd=str(PROJECT_ROOT),
            check=True,
            capture_output=True,
        )
        print(f"  Rama git creada: blog/{slug}")
    except subprocess.CalledProcessError:
        print(f"  Aviso: no se pudo crear rama git blog/{slug} (puede que ya exista)")

    print(f"\n  Draft listo: {draft_path.relative_to(PROJECT_ROOT)}")
    print(f"  Revisa el archivo y confirma con:")
    print(f"  python marketing-os/marketing_os.py --publish {slug}\n")
    return draft_path


def publish_draft(slug: str) -> None:
    """
    Paso 2 del flujo Human-in-the-Loop:
    - Lee el draft aprobado
    - Inserta en lib/blog.ts
    - Verifica con tsc --noEmit
    - Hace commit en git
    """
    draft_path = BLOG_DRAFTS_DIR / f"draft_{slug}.json"
    if not draft_path.exists():
        raise FileNotFoundError(f"Draft no encontrado: {draft_path}")

    post_data = json.loads(draft_path.read_text(encoding="utf-8"))
    validate_against_blogpost_interface(post_data)

    # Reemplaza placeholder de imagen con u() de Unsplash si no hay imagen real
    if post_data.get("image", "").startswith("/images/blog/draft-"):
        post_data["image"] = "__UNSPLASH_PLACEHOLDER__"
        print("  Aviso: imagen placeholder detectada. Usando Unsplash fallback.")

    insert_into_blog_ts(post_data)

    # Verificar TypeScript
    result = subprocess.run(
        ["npx", "tsc", "--noEmit"],
        cwd=str(PROJECT_ROOT),
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"Error de TypeScript después de insertar post:\n{result.stdout}\n{result.stderr}")

    # Commit
    subprocess.run(["git", "add", "lib/blog.ts"], cwd=str(PROJECT_ROOT), check=True)
    subprocess.run(
        ["git", "commit", "-m", f"blog: add post {slug}"],
        cwd=str(PROJECT_ROOT),
        check=True,
    )
    print(f"\n  Post publicado en lib/blog.ts")
    print(f"  Commit creado: blog: add post {slug}")
    print(f"  Despliega con: npx vercel --prod\n")


def _post_to_ts_object(post: dict) -> str:
    """Convierte un dict BlogPost a un object literal TypeScript formateado."""
    image_val = post.get("image", "")
    if image_val == "__UNSPLASH_PLACEHOLDER__":
        image_str = 'u("1559757148-127dd04d8e25")'
    elif image_val.startswith("/images/"):
        image_str = f'"{image_val}"'
    else:
        image_str = f'u("{image_val}")'

    content_json = json.dumps(post["content"], ensure_ascii=False, indent=6)
    tags_json = json.dumps(post["tags"], ensure_ascii=False)

    return f"""  {{
    slug: "{post['slug']}",
    title: "{post['title'].replace('"', '\\"')}",
    excerpt: "{post['excerpt'].replace('"', '\\"')}",
    date: "{post['date']}",
    dateFormatted: "{post.get('dateFormatted', '')}",
    author: "{post.get('author', 'Equipo Organnical')}",
    authorRole: "{post.get('authorRole', 'Medicina Integrativa')}",
    category: "{post['category']}",
    tags: {tags_json},
    image: {image_str},
    readTime: {post.get('readTime', 7)},
    content: {content_json},
  }}"""


def insert_into_blog_ts(post: dict) -> None:
    """Inserta el post al inicio del array posts en lib/blog.ts."""
    content = BLOG_TS.read_text(encoding="utf-8")

    # Busca el inicio del array
    marker = "export const posts: BlogPost[] = ["
    if marker not in content:
        raise ValueError("No se encontró el marcador del array 'posts' en lib/blog.ts")

    ts_object = _post_to_ts_object(post)
    # Inserta el nuevo post como primer elemento del array
    new_content = content.replace(
        marker,
        f"{marker}\n{ts_object},",
        1,
    )
    BLOG_TS.write_text(new_content, encoding="utf-8")
