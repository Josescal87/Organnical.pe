import json
from datetime import datetime
from pathlib import Path

OUTPUTS_DIR = Path(__file__).parent.parent / "outputs"


def _timestamp() -> str:
    return datetime.now().strftime("%Y%m%d_%H%M%S")


def save_outputs(result: dict, task_type: str, fmt: str = "markdown") -> list[Path]:
    """
    Guarda los outputs de cada agente en el directorio correspondiente.
    Devuelve lista de paths de archivos guardados.
    """
    saved = []
    ts = _timestamp()
    resultados = result.get("resultados", {})

    dir_map = {
        "seo_specialist": OUTPUTS_DIR / "seo",
        "content_creator": OUTPUTS_DIR / "blog",
        "social_media": OUTPUTS_DIR / "social",
        "whatsapp_crm": OUTPUTS_DIR / "whatsapp",
        "compliance_checker": OUTPUTS_DIR / "compliance_log",
    }

    for agent_name, output_text in resultados.items():
        target_dir = dir_map.get(agent_name, OUTPUTS_DIR)
        target_dir.mkdir(parents=True, exist_ok=True)

        ext = "json" if fmt == "json" else "md"
        filename = f"{ts}_{agent_name}.{ext}"
        filepath = target_dir / filename

        if fmt == "json":
            try:
                data = json.loads(output_text)
                filepath.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
            except json.JSONDecodeError:
                # Si no es JSON válido, guarda como texto
                filepath = target_dir / f"{ts}_{agent_name}.md"
                filepath.write_text(output_text, encoding="utf-8")
        else:
            filepath.write_text(output_text, encoding="utf-8")

        saved.append(filepath)

    return saved


def save_compliance_log(compliance_data: dict, task: str) -> Path:
    """Guarda el log de rechazo del compliance checker."""
    log_dir = OUTPUTS_DIR / "compliance_log"
    log_dir.mkdir(parents=True, exist_ok=True)

    ts = _timestamp()
    filepath = log_dir / f"{ts}_RECHAZADO.json"
    log = {"task": task, "timestamp": ts, **compliance_data}
    filepath.write_text(json.dumps(log, ensure_ascii=False, indent=2), encoding="utf-8")
    return filepath


def print_summary(result: dict) -> None:
    """Imprime un resumen legible de los resultados."""
    plan = result.get("plan", {})
    resultados = result.get("resultados", {})

    print(f"\n{'='*60}")
    print(f"OBJETIVO: {plan.get('objetivo', 'N/A')}")
    print(f"{'='*60}")

    for agent_name, output in resultados.items():
        preview = output[:200].replace("\n", " ")
        print(f"\n[{agent_name.upper()}]")
        print(f"  {preview}...")
        print(f"  ({len(output)} caracteres generados)")
    print()
