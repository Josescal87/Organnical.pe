/** Extrae solo el mensaje de un error, sin exponer objetos con PHI en los logs. */
export function sanitizeError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unknown error";
}
