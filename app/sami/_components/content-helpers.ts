import type { SamiCategory } from '@/lib/supabase/database.types'

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
