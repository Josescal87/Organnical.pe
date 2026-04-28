import type { SamiCategory, SamiRegion } from '@/lib/supabase/database.types'

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
    meditacion:  'Meditaciones',
    cuento:      'Cuentos para dormir',
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
  { bg: string; accent: string; glow: string; border: string; name: string; description: string }
> = {
  costa: {
    bg:          '#0a0f1e',
    accent:      '#4a9ebb',
    glow:        'rgba(74,158,187,0.15)',
    border:      'rgba(74,158,187,0.3)',
    name:        'Costa',
    description: 'Leyendas del Pacífico',
  },
  sierra: {
    bg:          '#0f0a1e',
    accent:      '#a78bfa',
    glow:        'rgba(167,139,250,0.15)',
    border:      'rgba(167,139,250,0.3)',
    name:        'Sierra',
    description: 'El cielo andino',
  },
  selva: {
    bg:          '#0a1a0f',
    accent:      '#4ade80',
    glow:        'rgba(74,222,128,0.15)',
    border:      'rgba(74,222,128,0.3)',
    name:        'Selva',
    description: 'La Amazonía de noche',
  },
  universal: {
    bg:          '#0f0a1e',
    accent:      '#a78bfa',
    glow:        'rgba(167,139,250,0.15)',
    border:      'rgba(167,139,250,0.3)',
    name:        'Sami',
    description: 'Para cualquier noche',
  },
}

export const REGIONS: { id: Exclude<SamiRegion, 'universal'>; icon: string }[] = [
  { id: 'costa',  icon: '🌊' },
  { id: 'sierra', icon: '⛰️' },
  { id: 'selva',  icon: '🌿' },
]
