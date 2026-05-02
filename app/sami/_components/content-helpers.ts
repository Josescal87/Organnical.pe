import type { SamiCategory, SamiRegion } from '@/lib/supabase/database.types'

// ── Design tokens (v3) ──────────────────────────────────────────────────────
export const C = {
  bg0:    '#0c0920',
  bg1:    '#130f2e',
  bg2:    '#1c1845',
  bg3:    '#261f58',
  purp:   '#8b6fe8',
  purpL:  '#a78bfa',
  purpXL: '#c4b5fd',
  purpD:  '#5b45b0',
  purpDD: '#3b2d80',
  text:   '#f0ecff',
  textM:  '#c4b5fd',
  textD:  '#7c6baa',
  stroke: '#3d2b6e',
} as const

export function categoryIcon(cat: SamiCategory): string {
  const icons: Record<SamiCategory, string> = {
    meditacion:  '🧘',
    cuento:      '🌙',
    ruido:       '🌊',
    respiracion: '💨',
  }
  return icons[cat]
}

export function categoryLabel(cat: SamiCategory): string {
  const labels: Record<SamiCategory, string> = {
    meditacion:  'Meditación',
    cuento:      'Cuento',
    ruido:       'Ruido blanco',
    respiracion: 'Respiración',
  }
  return labels[cat]
}

export function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60)
  return `${mins} min`
}

export const REGION_THEMES: Record<
  SamiRegion,
  {
    bg: string; accent: string; accentD: string; accentL: string
    glow: string; border: string; stroke: string
    name: string; description: string; subtitle: string
    mascotPose: 'caminando' | 'sentado' | 'parado'
  }
> = {
  costa: {
    bg:          '#07111c',
    accent:      '#5ec9e8',
    accentD:     '#2a8aab',
    accentL:     '#a8ecf8',
    glow:        'rgba(94,201,232,0.15)',
    border:      'rgba(94,201,232,0.3)',
    stroke:      '#1a4a60',
    name:        'Costa',
    description: 'El Pacífico peruano susurra bajo la neblina. Deja que sus olas antiguas te lleven.',
    subtitle:    'Las olas te llevan al sueño',
    mascotPose:  'caminando',
  },
  sierra: {
    bg:          '#0d0920',
    accent:      '#a78bfa',
    accentD:     '#6d4fd6',
    accentL:     '#e9d5ff',
    glow:        'rgba(167,139,250,0.15)',
    border:      'rgba(167,139,250,0.3)',
    stroke:      '#3d2b6e',
    name:        'Sierra',
    description: 'Desde los Andes el cielo más puro. Las apachetas guardan silencio ancestral.',
    subtitle:    'Las estrellas del Ande te cuidan',
    mascotPose:  'sentado',
  },
  selva: {
    bg:          '#060e09',
    accent:      '#5ae891',
    accentD:     '#28a058',
    accentL:     '#bbf7d0',
    glow:        'rgba(90,232,145,0.15)',
    border:      'rgba(90,232,145,0.3)',
    stroke:      '#1a4a28',
    name:        'Selva',
    description: 'En lo profundo del Amazonas la noche es vida. Luciérnagas y ríos te acompañan.',
    subtitle:    'La selva respira contigo',
    mascotPose:  'parado',
  },
  universal: {
    bg:          '#0d0920',
    accent:      '#a78bfa',
    accentD:     '#6d4fd6',
    accentL:     '#e9d5ff',
    glow:        'rgba(167,139,250,0.15)',
    border:      'rgba(167,139,250,0.3)',
    stroke:      '#3d2b6e',
    name:        'Sami',
    description: 'Para cualquier noche. Sami te acompaña donde estés.',
    subtitle:    'Tu compañero de cada noche',
    mascotPose:  'sentado',
  },
}

export const REGIONS: { id: Exclude<SamiRegion, 'universal'>; icon: string }[] = [
  { id: 'costa',  icon: '🌊' },
  { id: 'sierra', icon: '⛰️' },
  { id: 'selva',  icon: '🌿' },
]

export const REGION_BADGE_LABELS: Record<Exclude<SamiRegion, 'universal'>, string> = {
  costa:  '🌊 Costa',
  sierra: '⛰️ Sierra',
  selva:  '🌿 Selva',
}

export const REGION_TRAVEL_SUBTITLES: Record<Exclude<SamiRegion, 'universal'>, string> = {
  costa:  'Las olas te llevan al sueño',
  sierra: 'Las estrellas del Ande te cuidan',
  selva:  'La selva respira contigo',
}

export const REGION_PLAYER_STYLES: Record<SamiRegion, {
  gradient: string
  progressColor: string
  glowColor: string
}> = {
  costa:     { gradient: 'radial-gradient(ellipse at 50% 0%, rgba(94,201,232,0.20) 0%, transparent 65%)',   progressColor: '#5ec9e8', glowColor: 'rgba(94,201,232,0.35)'   },
  sierra:    { gradient: 'radial-gradient(ellipse at 50% 0%, rgba(167,139,250,0.20) 0%, transparent 65%)',  progressColor: '#a78bfa', glowColor: 'rgba(167,139,250,0.35)'  },
  selva:     { gradient: 'radial-gradient(ellipse at 50% 0%, rgba(90,232,145,0.20) 0%, transparent 65%)',   progressColor: '#5ae891', glowColor: 'rgba(90,232,145,0.35)'   },
  universal: { gradient: 'radial-gradient(ellipse at 50% 0%, rgba(167,139,250,0.20) 0%, transparent 65%)',  progressColor: '#a78bfa', glowColor: 'rgba(167,139,250,0.35)'  },
}
