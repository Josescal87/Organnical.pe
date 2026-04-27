# Configuración de Sami en Vercel

## Dominio adicional requerido

En el Dashboard de Vercel → Settings → Domains → agregar:

- `sami.organnical.pe` → apunta al mismo proyecto Organnical.pe

Configurar el registro DNS en el proveedor de dominio:

```
CNAME  sami  cname.vercel-dns.com
```

## Schema Supabase

En Supabase Dashboard → Settings → API → Exposed schemas → agregar:

- `sami`

## Notas

- Las rutas del subdominio se sirven desde `app/(sami)/` via el rewrite en `vercel.json`.
- El middleware detecta `sami.organnical.pe` y aplica auth a todas las rutas excepto `/login`.
- Estos pasos son manuales y no se pueden automatizar con código.
