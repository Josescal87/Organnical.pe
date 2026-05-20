// Constantes comerciales y lista de distritos para checkout.

export const FREE_DELIVERY_THRESHOLD = 300
export const PICKUP_DISTRITO = "Recojo en tienda"
export const DELIVERY_FALLBACK = 15
export const MP_MIN_AMOUNT = 5

export function isPickup(distrito?: string): boolean {
  return distrito === PICKUP_DISTRITO
}

export const DISTRITOS = [
  PICKUP_DISTRITO,
  "Miraflores", "San Isidro", "San Borja", "Surco", "La Molina",
  "Barranco", "Chorrillos", "Jesús María", "Lince", "Magdalena del Mar",
  "Pueblo Libre", "San Miguel", "Breña", "Cercado de Lima", "Rímac",
  "San Martín de Porres", "Los Olivos", "Independencia", "Comas", "Carabayllo",
  "Ate", "Santa Anita", "La Victoria", "El Agustino", "San Juan de Lurigancho",
  "San Juan de Miraflores", "Villa María del Triunfo", "Villa El Salvador",
  "Lurín", "Pachacámac", "Callao",
  "Otro",
] as const
