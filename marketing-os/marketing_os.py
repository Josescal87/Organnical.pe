#!/usr/bin/env python3
"""
Marketing OS — CLI de Organnical.pe

Uso:
  # Campaña completa (SEO + Blog + Social + WhatsApp + Compliance)
  python marketing-os/marketing_os.py --task "Campaña menopausia y sueño"

  # Solo artículo de blog (guarda draft + crea rama git)
  python marketing-os/marketing_os.py --task "CBD para TDAH en adultos" --type blog

  # Publicar draft aprobado manualmente (Paso 2)
  python marketing-os/marketing_os.py --publish cbd-para-tdah-en-adultos

  # Solo keywords SEO
  python marketing-os/marketing_os.py --task "Keywords dolor articular Peru" --type seo

  # Solo contenido para redes sociales
  python marketing-os/marketing_os.py --task "Posts IG salud mental semana" --type social

  # Solo plantillas WhatsApp
  python marketing-os/marketing_os.py --task "Secuencia nurturing ansiedad" --type whatsapp
"""

import argparse
import os
import sys
from pathlib import Path

# Cargar .env.local desde la raíz del proyecto Next.js (directorio padre)
_env_path = Path(__file__).parent.parent / ".env.local"
if _env_path.exists():
    try:
        from dotenv import load_dotenv
        load_dotenv(_env_path)
    except ImportError:
        # Parseo manual mínimo si python-dotenv no está instalado
        for line in _env_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, val = line.partition("=")
                os.environ.setdefault(key.strip(), val.strip())

# Asegurar que el directorio marketing-os está en el path
sys.path.insert(0, str(Path(__file__).parent))


def check_api_key() -> None:
    if not os.getenv("ANTHROPIC_API_KEY"):
        print(
            "\n  ERROR: ANTHROPIC_API_KEY no encontrada.\n"
            "  Agrégala a tu archivo .env.local:\n"
            "  ANTHROPIC_API_KEY=sk-ant-...\n",
            file=sys.stderr,
        )
        sys.exit(1)


def cmd_run(args: argparse.Namespace) -> None:
    """Ejecuta el pipeline de agentes."""
    check_api_key()

    from orchestrator import OrchestratorAgent, ComplianceError
    from tools.output_formatter import save_outputs, print_summary
    from tools.blog_writer import save_draft

    # Construir tarea completa con tipo
    type_prefix = {
        "campana": "",
        "blog": "[TIPO: blog — genera SOLO seo_specialist y content_creator] ",
        "seo": "[TIPO: seo — activa SOLO seo_specialist] ",
        "social": "[TIPO: social — activa SOLO social_media] ",
        "whatsapp": "[TIPO: whatsapp — activa SOLO whatsapp_crm] ",
    }
    task = type_prefix.get(args.type, "") + args.task

    orchestrator = OrchestratorAgent()

    try:
        result = orchestrator.run(task, verbose=not args.quiet)
    except ComplianceError as e:
        print(f"\n  RECHAZADO: {e}\n", file=sys.stderr)
        sys.exit(2)

    # Guardar outputs
    saved = save_outputs(result, args.type, "markdown")

    if not args.quiet:
        print_summary(result)

    # Flujo Human-in-the-Loop para blog
    if args.type == "blog" and "content_creator" in result.get("resultados", {}):
        content_output = result["resultados"]["content_creator"]
        try:
            draft_path = save_draft(content_output)
        except (ValueError, KeyError) as e:
            print(f"\n  Aviso: no se pudo guardar draft automático: {e}", file=sys.stderr)
            print("  Revisa el archivo en outputs/blog/ manualmente.\n", file=sys.stderr)
    else:
        print(f"\n Outputs guardados:")
        for f in saved:
            print(f"   {f}")
        print()


def cmd_publish(args: argparse.Namespace) -> None:
    """Publica un draft aprobado en lib/blog.ts."""
    check_api_key()
    sys.path.insert(0, str(Path(__file__).parent))
    from tools.blog_writer import publish_draft

    slug = args.slug
    print(f"\n Publicando draft: {slug}...")
    try:
        publish_draft(slug)
    except FileNotFoundError as e:
        print(f"\n  ERROR: {e}", file=sys.stderr)
        print(f"  Asegúrate de haber ejecutado primero:", file=sys.stderr)
        print(f"  python marketing-os/marketing_os.py --task '...' --type blog\n", file=sys.stderr)
        sys.exit(1)
    except RuntimeError as e:
        print(f"\n  ERROR TypeScript: {e}", file=sys.stderr)
        sys.exit(1)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Marketing OS — Organnical.pe",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    subparsers = parser.add_subparsers(dest="command")

    # Comando principal: --task
    parser.add_argument("--task", metavar="TAREA", help="Tarea de marketing en español")
    parser.add_argument(
        "--type",
        choices=["campana", "blog", "seo", "social", "whatsapp"],
        default="campana",
        help="Tipo de tarea (default: campana = pipeline completo)",
    )
    parser.add_argument(
        "--publish",
        metavar="SLUG",
        help="Publicar draft aprobado por su slug (ej: cbd-para-tdah-adultos)",
    )
    parser.add_argument("--quiet", action="store_true", help="Modo silencioso")
    parser.add_argument("--verbose", action="store_true", help="Mostrar uso de tokens")

    args = parser.parse_args()

    if args.publish:
        args.slug = args.publish
        cmd_publish(args)
    elif args.task:
        cmd_run(args)
    else:
        parser.print_help()
        sys.exit(0)


if __name__ == "__main__":
    main()
