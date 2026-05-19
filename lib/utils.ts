import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number): string {
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return "S/ —"
  }
  return `S/ ${amount.toFixed(2)}`
}
