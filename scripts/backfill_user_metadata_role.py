"""
Backfill user_metadata.role para usuarios sin rol en JWT.

CAUSA: el trigger medical.handle_new_user() no se está ejecutando en signups
recientes (probablemente por el flujo de Hercu o cambios post-migración),
dejando 13 usuarios con auth.user_metadata.role = NULL aunque su perfil en
medical.profiles tiene role correcto. Esto causa un redirect-loop en
/dashboard/paciente (ver middleware.ts).

Este script lee medical.profiles.role para cada usuario afectado y escribe
auth.users.raw_user_meta_data.role vía el endpoint admin de Supabase.

Uso (one-shot):
    python scripts/backfill_user_metadata_role.py [--dry-run]

Requiere SUPABASE_SECRET_KEY en .env.local.

Histórico de ejecuciones:
- 2026-05-08: 10 pacientes corregidos; 3 cuentas internas saltadas.
"""

import argparse
import json
import os
import sys
import urllib.request
import urllib.error
from pathlib import Path


def load_env() -> dict[str, str]:
    env_path = Path(__file__).resolve().parent.parent / ".env.local"
    env: dict[str, str] = {}
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.lstrip().startswith("#"):
                k, _, v = line.partition("=")
                env[k.strip()] = v.strip()
    return env


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Solo listar, sin escribir")
    args = parser.parse_args()

    env = load_env()
    url = env.get("NEXT_PUBLIC_SUPABASE_URL")
    key = env.get("SUPABASE_SECRET_KEY")
    if not url or not key:
        print("ERROR: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY no encontrados en .env.local")
        return 1

    headers = {"apikey": key, "Authorization": f"Bearer {key}"}

    # 1) Listar usuarios desde auth.users — paginar
    print("Listando auth.users...")
    affected: list[dict[str, object]] = []
    page = 1
    while True:
        req = urllib.request.Request(
            f"{url}/auth/v1/admin/users?per_page=200&page={page}",
            headers=headers,
        )
        with urllib.request.urlopen(req) as r:
            data = json.loads(r.read())
        users = data.get("users", [])
        if not users:
            break
        for u in users:
            meta = u.get("user_metadata") or {}
            if not meta.get("role"):
                affected.append(u)
        if len(users) < 200:
            break
        page += 1

    print(f"Usuarios SIN role en JWT: {len(affected)}")
    if not affected:
        print("Nada que hacer.")
        return 0

    # 2) Para cada uno, leer medical.profiles.role
    updated = 0
    skipped = 0
    for u in affected:
        uid = u["id"]
        email = u.get("email")
        prof_req = urllib.request.Request(
            f"{url}/rest/v1/profiles?select=role&id=eq.{uid}",
            headers={**headers, "Accept-Profile": "medical"},
        )
        try:
            with urllib.request.urlopen(prof_req) as r:
                profs = json.loads(r.read())
        except urllib.error.HTTPError as e:
            print(f"  [{email}] error leyendo profile: {e.code}")
            skipped += 1
            continue

        if not profs or not profs[0].get("role"):
            print(f"  [{email}] sin profile o sin role en medical.profiles -> skip")
            skipped += 1
            continue

        role = profs[0]["role"]
        existing_meta = u.get("user_metadata") or {}
        new_meta = {**existing_meta, "role": role}

        if args.dry_run:
            print(f"  [DRY-RUN] {email} -> role={role}")
            continue

        # 3) Actualizar user_metadata
        update_payload = json.dumps({"user_metadata": new_meta}).encode()
        update_req = urllib.request.Request(
            f"{url}/auth/v1/admin/users/{uid}",
            method="PUT",
            data=update_payload,
            headers={**headers, "Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(update_req) as r:
                _ = r.read()
            print(f"  [OK] {email} -> role={role}")
            updated += 1
        except urllib.error.HTTPError as e:
            print(f"  [FAIL] {email}: {e.code} {e.read().decode()[:200]}")
            skipped += 1

    print(f"\nResultado: {updated} actualizados, {skipped} saltados, {len(affected)} totales.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
