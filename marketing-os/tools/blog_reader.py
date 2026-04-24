import re
from pathlib import Path

BLOG_TS = Path(__file__).parent.parent.parent / "lib" / "blog.ts"


def get_existing_slugs_and_titles() -> list[dict]:
    """Extrae slugs y títulos del array posts en lib/blog.ts."""
    content = BLOG_TS.read_text(encoding="utf-8")
    slugs = re.findall(r'slug:\s*"([^"]+)"', content)
    titles = re.findall(r'title:\s*"([^"]+)"', content)
    return [{"slug": s, "title": t} for s, t in zip(slugs, titles)]


def format_existing_posts_for_seo(posts: list[dict]) -> str:
    """Formatea la lista de posts para inyectarla en la instrucción del SEO agent."""
    if not posts:
        return "No hay artículos existentes en el blog aún."
    lines = [f"- [{p['slug']}] {p['title']}" for p in posts]
    return "\n".join(lines)
