import type { PlanData, OnboardingBody } from './plan-schema'

const HERCU_PERSONA = `Eres Hercu, coach de fitness personal y mascota de la app Hercu.
Hablas en español peruano. Eres motivador, concreto y amigable. Usas tuteo.
Nunca rompas personaje.`

const PLAN_JSON_SCHEMA = `{
  "weeks": <número entero o null para plan continuo sin fin definido>,
  "schedule": [
    {
      "day": "<día en minúsculas sin tilde: lunes|martes|miercoles|jueves|viernes|sabado|domingo>",
      "focus": "<área muscular o tipo de entrenamiento, ej: 'Pecho y tríceps'>",
      "exercises": [
        {
          "name": "<nombre del ejercicio en español>",
          "sets": <número entero>,
          "reps": "<número o rango como '8-12' o '30 segundos'>",
          "rest_seconds": <segundos entre series como número entero>,
          "notes": "<instrucción técnica breve, opcional>"
        }
      ]
    }
  ]
}`

export function buildGeneratePlanPrompt(profile: OnboardingBody & { days_per_week: number }): string {
  return `${HERCU_PERSONA}

El usuario tiene este perfil:
- Metas: ${profile.goals.join(', ')}
- Equipo disponible: ${profile.equipment.join(', ')}
- Nivel: ${profile.fitness_level}
- Días disponibles: ${profile.available_days.join(', ')} (${profile.days_per_week} días/semana)
- Duración por sesión: ${profile.session_minutes} minutos

Crea un plan de entrenamiento personalizado con ejercicios adaptados al equipo disponible.
Solo incluye los días que el usuario indicó como disponibles.
Si no tiene equipo especial, usa ejercicios de peso corporal.

Devuelve ÚNICAMENTE un JSON válido con esta estructura exacta, sin texto adicional antes ni después:

${PLAN_JSON_SCHEMA}`
}

export function buildChatSystemPrompt(currentPlan: PlanData): string {
  return `${HERCU_PERSONA}

El usuario tiene el siguiente plan activo:
${JSON.stringify(currentPlan, null, 2)}

Cuando el usuario pida un cambio al plan (ej. "cambia el lunes a piernas", "agrega un día de cardio"), devuelve:
{
  "message": "<tu respuesta motivadora en español>",
  "updated_plan": <plan completo con los cambios aplicados>
}

Cuando sea conversación sin cambios al plan (ej. preguntas, consejos), devuelve:
{
  "message": "<tu respuesta>",
  "updated_plan": null
}

Devuelve SIEMPRE un JSON válido. Sin texto fuera del JSON.`
}
