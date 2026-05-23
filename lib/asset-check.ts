import "server-only"
import { cache } from "react"

/**
 * Verifica si una URL de asset (imagen, PDF) existe haciendo HEAD con caché.
 *
 * Use-case: la tabla `marcas` tiene URLs de logo/hero apuntando a Supabase Storage,
 * pero el archivo físico puede no haberse subido aún. Si pasamos la URL al
 * `<Image>` de Next, el browser pide la URL y devuelve 400 → broken image visible
 * para el usuario. Con esta función podemos null-ear la URL en el server antes
 * de mandarla al componente, que entonces renderiza su fallback decente.
 *
 * Cache: `force-cache` + revalidate 5min. Cuando el usuario sube el archivo a
 * Storage, la página se auto-cura en ~5 minutos sin redeploy.
 *
 * Falla silenciosa (devuelve false) ante cualquier error de red o respuesta no-2xx.
 */
export const assetExists = cache(async (url: string | null | undefined): Promise<boolean> => {
  if (!url) return false
  try {
    const res = await fetch(url, {
      method: "HEAD",
      cache: "force-cache",
      next: { revalidate: 300 },
    })
    return res.ok
  } catch {
    return false
  }
})

/**
 * Aplica `assetExists` a varias URLs en paralelo y devuelve un mapa
 * `{ originalUrl: existeBool }` para que el caller decida qué hacer.
 *
 * Devuelve `null` para las URLs que no existen, manteniendo la URL original
 * para las que sí — pensado para usar como `assetUrl ?? null`.
 */
export async function resolveAssetUrls<T extends Record<string, string | null | undefined>>(
  urls: T
): Promise<{ [K in keyof T]: string | null }> {
  const entries = Object.entries(urls) as [keyof T, string | null | undefined][]
  const results = await Promise.all(
    entries.map(async ([key, url]) => {
      const exists = await assetExists(url)
      return [key, exists ? (url as string) : null] as const
    })
  )
  return Object.fromEntries(results) as { [K in keyof T]: string | null }
}
