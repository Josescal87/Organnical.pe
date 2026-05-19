import { z } from 'zod'

export const ExerciseSchema = z.object({
  name:         z.string(),
  sets:         z.number().int().positive(),
  reps:         z.string(),
  rest_seconds: z.number().int().nonnegative(),
  notes:        z.string().optional(),
})

export const ScheduleDaySchema = z.object({
  day:       z.string(),
  focus:     z.string(),
  exercises: z.array(ExerciseSchema),
})

export const PlanDataSchema = z.object({
  weeks:    z.number().int().positive().nullable(),
  schedule: z.array(ScheduleDaySchema).max(14),
})

export const HercuAIResponseSchema = z.object({
  message:      z.string(),
  updated_plan: PlanDataSchema.nullable(),
})

export const OnboardingBodySchema = z.object({
  goals:           z.array(z.string().max(100)).min(1).max(10),
  equipment:       z.array(z.string().max(100)).min(1).max(10),
  fitness_level:   z.enum(['principiante', 'intermedio', 'avanzado']),
  available_days:  z.array(z.string().max(20)).min(1).max(7),
  session_minutes: z.number().int().min(10).max(120),
})

export type Exercise        = z.infer<typeof ExerciseSchema>
export type ScheduleDay     = z.infer<typeof ScheduleDaySchema>
export type PlanData        = z.infer<typeof PlanDataSchema>
export type HercuAIResponse = z.infer<typeof HercuAIResponseSchema>
export type OnboardingBody  = z.infer<typeof OnboardingBodySchema>
