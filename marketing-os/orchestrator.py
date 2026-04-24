import json
import sys
from pathlib import Path

import anthropic

AGENTS_DIR = Path(__file__).parent / "agents"
CONTEXT_DIR = Path(__file__).parent / "context"
PROJECT_ROOT = Path(__file__).parent.parent


def load_prompt(agent_name: str) -> str:
    path = AGENTS_DIR / f"{agent_name}.md"
    if not path.exists():
        raise FileNotFoundError(f"System prompt no encontrado: {path}")
    return path.read_text(encoding="utf-8")


def load_brand_context() -> str:
    path = CONTEXT_DIR / "brand_knowledge.md"
    if not path.exists():
        raise FileNotFoundError(f"Brand knowledge no encontrado: {path}")
    return path.read_text(encoding="utf-8")


class ComplianceError(Exception):
    pass


class SpecialistAgent:
    def __init__(self, agent_name: str, brand_context: str = "", model: str = "claude-sonnet-4-6"):
        self.name = agent_name
        self.model = model
        self.client = anthropic.Anthropic()
        agent_prompt = load_prompt(agent_name)
        # Inyectar brand_knowledge como prefijo del system prompt
        if brand_context:
            self.system = (
                f"<brand_knowledge>\n{brand_context}\n</brand_knowledge>\n\n{agent_prompt}"
            )
        else:
            self.system = agent_prompt

    def run(self, user_message: str, context: dict | None = None) -> str:
        """Ejecuta el agente con contexto acumulado de agentes previos."""
        if context:
            context_text = "\n\n".join(
                f"## Output de {k}:\n{v}" for k, v in context.items()
            )
            full_message = (
                f"<contexto_previo>\n{context_text}\n</contexto_previo>\n\n{user_message}"
            )
        else:
            full_message = user_message

        response = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            system=self.system,
            messages=[{"role": "user", "content": full_message}],
        )
        output = response.content[0].text
        if "--verbose" in sys.argv:
            usage = response.usage
            print(
                f"    [{self.name}] tokens: {usage.input_tokens}→{usage.output_tokens}",
                file=sys.stderr,
            )
        return output


class OrchestratorAgent:
    def __init__(self, model: str = "claude-sonnet-4-6"):
        self.client = anthropic.Anthropic()
        self.model = model
        self.brand_context = load_brand_context()
        self.director_system = (
            f"<brand_knowledge>\n{self.brand_context}\n</brand_knowledge>\n\n"
            + load_prompt("director")
        )
        self.specialists: dict[str, SpecialistAgent] = {
            name: SpecialistAgent(name, self.brand_context, model)
            for name in [
                "seo_specialist",
                "content_creator",
                "social_media",
                "whatsapp_crm",
                "compliance_checker",
            ]
        }

    def plan(self, task: str) -> dict:
        """El Director genera un plan JSON con los agentes a invocar."""
        response = self.client.messages.create(
            model=self.model,
            max_tokens=1024,
            system=self.director_system,
            messages=[{"role": "user", "content": f"Tarea recibida: {task}"}],
        )
        raw = response.content[0].text
        # Extrae JSON robusto a markdown fences
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start == -1:
            raise ValueError(f"El Director no devolvió JSON válido:\n{raw}")
        return json.loads(raw[start:end])

    def _build_seo_instruction(self, base_instruction: str) -> str:
        """Agrega los slugs existentes a la instrucción del SEO specialist."""
        try:
            from tools.blog_reader import get_existing_slugs_and_titles, format_existing_posts_for_seo
            existing = get_existing_slugs_and_titles()
            existing_str = format_existing_posts_for_seo(existing)
        except Exception:
            existing_str = "No se pudieron leer los artículos existentes."

        return (
            f"{base_instruction}\n\n"
            f"<articulos_existentes>\n"
            f"Los siguientes artículos YA EXISTEN en el blog. "
            f"NO repitas estos temas ni slugs similares:\n"
            f"{existing_str}\n"
            f"</articulos_existentes>\n\n"
            f"Busca ángulos nuevos, long-tails no cubiertas o sub-temas distintos."
        )

    def _apply_corrections(self, results: dict, problemas: list[dict]) -> dict:
        """Aplica sugerencias de corrección del compliance checker (best-effort)."""
        for problema in problemas:
            if problema.get("severidad") == "baja" and problema.get("sugerencia_correccion"):
                agente = problema.get("agente_origen", "")
                fragmento = problema.get("fragmento", "")
                correccion = problema["sugerencia_correccion"]
                if agente in results and fragmento:
                    results[agente] = results[agente].replace(fragmento, correccion, 1)
        return results

    def _save_compliance_log(self, compliance_data: dict, task: str) -> None:
        try:
            from tools.output_formatter import save_compliance_log
            path = save_compliance_log(compliance_data, task)
            print(f"  Log de compliance guardado: {path}")
        except Exception as e:
            print(f"  Aviso: no se pudo guardar log de compliance: {e}")

    def run(self, task: str, verbose: bool = True) -> dict:
        """Orquesta la ejecución completa."""
        if verbose:
            print(f"\n Director procesando: {task}\n")

        plan = self.plan(task)

        if verbose:
            print(f" Objetivo: {plan.get('objetivo', '?')}")
            agentes_nombres = [a["nombre"] for a in plan.get("agentes", [])]
            print(f" Pipeline: {' → '.join(agentes_nombres)}\n")

        results: dict[str, str] = {}
        agentes_ordenados = sorted(plan.get("agentes", []), key=lambda x: x.get("orden", 99))

        for agente_plan in agentes_ordenados:
            nombre = agente_plan["nombre"]
            instruccion = agente_plan["instruccion"]

            if nombre not in self.specialists:
                print(f"  Aviso: agente '{nombre}' no reconocido, saltando.")
                continue

            # Enriquecer instrucción del SEO con slugs existentes
            if nombre == "seo_specialist":
                instruccion = self._build_seo_instruction(instruccion)

            if verbose:
                print(f" Ejecutando {nombre}...")

            resultado = self.specialists[nombre].run(
                user_message=instruccion,
                context=results if results else None,
            )
            results[nombre] = resultado

            if verbose:
                print(f" {nombre} completado ({len(resultado):,} chars)\n")

        # Compliance check final (si hay al menos un resultado de contenido)
        content_agents = {"content_creator", "social_media", "whatsapp_crm"}
        if results.keys() & content_agents:
            if verbose:
                print(" Ejecutando compliance_checker...")

            consolidated = json.dumps(results, ensure_ascii=False)
            compliance_output = self.specialists["compliance_checker"].run(
                f"Revisa el siguiente output consolidado de los agentes de marketing:\n\n{consolidated}"
            )

            try:
                raw = compliance_output
                start = raw.find("{")
                end = raw.rfind("}") + 1
                compliance_data = json.loads(raw[start:end])
            except (json.JSONDecodeError, ValueError):
                compliance_data = {"veredicto": "APROBADO", "score_compliance": 80, "problemas_encontrados": []}

            veredicto = compliance_data.get("veredicto", "APROBADO")
            score = compliance_data.get("score_compliance", 100)

            if verbose:
                print(f" Compliance: {veredicto} (score: {score}/100)\n")

            if veredicto == "RECHAZADO":
                self._save_compliance_log(compliance_data, task)
                raise ComplianceError(
                    f"Output RECHAZADO por Compliance Checker (score: {score}/100).\n"
                    f"Problemas: {json.dumps(compliance_data.get('problemas_encontrados', []), ensure_ascii=False, indent=2)}"
                )

            if veredicto == "APROBADO_CON_CORRECCIONES":
                results = self._apply_corrections(results, compliance_data.get("problemas_encontrados", []))
                if verbose:
                    print(f" Correcciones de compliance aplicadas.\n")

            results["_compliance"] = compliance_output

        return {"plan": plan, "resultados": results}
