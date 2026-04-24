# Modo Light → IPRESS: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `ipress_mode` toggle to `medical.system_config` so the platform can operate without an IPRESS code (doctors prescribe under their personal CMP) and trivially activate full IPRESS compliance when the certification arrives.

**Architecture:** A single flag (`ipress_mode = 'disabled' | 'enabled'`) in the existing `medical.system_config` table controls: prescription number format, PDF document headers/footers, and the IPRESS gate on document issuance. A new `lib/ipress-config.ts` helper exposes `getIpressMode()` / `isIpressEnabled()` for server-side use. Both PDF components (`PrescriptionPDF`, `EncounterPDF`) receive `ipress_mode` as a prop and render conditionally.

**Tech Stack:** Next.js 15 Server Actions, Supabase admin client, `@react-pdf/renderer`, Vitest

---

## File Map

| File | Change |
|---|---|
| `supabase/migrations/013_ipress_light_mode.sql` | NEW — insert flag + update prescription number trigger |
| `lib/ipress-config.ts` | NEW — typed helper to read flag |
| `__tests__/lib/ipress-config.test.ts` | NEW — unit tests |
| `app/api/ehr/generate-pdf/route.ts` | MODIFY — `getIpress()` returns `ipress_mode` |
| `lib/pdf/PrescriptionPDF.tsx` | MODIFY — `PrescriptionPDFData` + conditional header/footer |
| `lib/pdf/EncounterPDF.tsx` | MODIFY — `EncounterPDFData` + conditional header/footer |
| `app/api/verificar-receta/route.ts` | MODIFY — only return `ipress_code` when IPRESS enabled |
| `app/dashboard/admin/ipress/actions.ts` | MODIFY — add `activateIpressMode` / `deactivateIpressMode` |
| `app/dashboard/admin/ipress/page.tsx` | MODIFY — fetch mode, show Light/IPRESS banner, toggle button |
| `app/(marketing)/preguntas-frecuentes/page.tsx` | MODIFY — remove "sello de la IPRESS" from FAQ |

---

## Task 1: DB Migration

**Files:**
- Create: `supabase/migrations/013_ipress_light_mode.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- Migration 013: IPRESS Light Mode
-- Adds ipress_mode flag to system_config.
-- When 'disabled': prescriptions use ORG- prefix, PDFs show doctor info only.
-- When 'enabled': prescriptions use IPRESS code prefix, PDFs show full IPRESS block.

-- 1. Insert the flag (default: disabled)
INSERT INTO medical.system_config (key, value, updated_at)
VALUES ('ipress_mode', 'disabled', now())
ON CONFLICT (key) DO NOTHING;

-- 2. Update the prescription number generator to respect the flag
CREATE OR REPLACE FUNCTION medical.generate_prescription_number()
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  v_mode  text;
  v_ipress text;
BEGIN
  SELECT value INTO v_mode  FROM medical.system_config WHERE key = 'ipress_mode';
  SELECT value INTO v_ipress FROM medical.system_config WHERE key = 'ipress_code';

  IF v_mode = 'enabled' AND v_ipress IS NOT NULL AND v_ipress NOT IN ('PENDIENTE', '') THEN
    RETURN v_ipress
      || '-' || to_char(now(), 'YYYY')
      || '-' || lpad(nextval('medical.prescription_seq')::text, 6, '0');
  ELSE
    RETURN 'ORG'
      || '-' || to_char(now(), 'YYYY')
      || '-' || lpad(nextval('medical.prescription_seq')::text, 6, '0');
  END IF;
END;
$$;
```

> The `set_prescription_number()` trigger and `trg_set_prescription_number` trigger in migration 08 call `medical.generate_prescription_number()` — no changes needed there.

- [ ] **Step 2: Apply the migration via Supabase CLI**

```bash
npx supabase db push
```

Expected: migration applies cleanly, `ipress_mode` row appears in `system_config`.

Verify manually in Supabase Dashboard → Table Editor → `medical.system_config`:
- `ipress_mode | disabled` row exists

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/013_ipress_light_mode.sql
git commit -m "feat(db): add ipress_mode flag, update prescription number generator"
```

---

## Task 2: `lib/ipress-config.ts` (new helper + tests)

**Files:**
- Create: `lib/ipress-config.ts`
- Create: `__tests__/lib/ipress-config.test.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/lib/ipress-config.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSingle = vi.fn();
const mockEq = vi.fn().mockReturnThis();
const mockSelect = vi.fn().mockReturnThis();
const mockFrom = vi.fn().mockReturnThis();
const mockSchema = vi.fn().mockReturnValue({
  from: mockFrom,
  select: mockSelect,
  eq: mockEq,
  single: mockSingle,
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn().mockReturnValue({ schema: mockSchema }),
}));

// The module under test is not created yet — this will fail to import
// until lib/ipress-config.ts exists.

describe("getIpressMode", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 'disabled' when flag is 'disabled'", async () => {
    mockSingle.mockResolvedValue({ data: { value: "disabled" }, error: null });
    const { getIpressMode } = await import("@/lib/ipress-config");
    expect(await getIpressMode()).toBe("disabled");
  });

  it("returns 'enabled' when flag is 'enabled'", async () => {
    mockSingle.mockResolvedValue({ data: { value: "enabled" }, error: null });
    const { getIpressMode } = await import("@/lib/ipress-config");
    expect(await getIpressMode()).toBe("enabled");
  });

  it("defaults to 'disabled' when row is missing", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: "not found" } });
    const { getIpressMode } = await import("@/lib/ipress-config");
    expect(await getIpressMode()).toBe("disabled");
  });
});

describe("isIpressEnabled", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns false when mode is disabled", async () => {
    mockSingle.mockResolvedValue({ data: { value: "disabled" }, error: null });
    const { isIpressEnabled } = await import("@/lib/ipress-config");
    expect(await isIpressEnabled()).toBe(false);
  });

  it("returns true when mode is enabled", async () => {
    mockSingle.mockResolvedValue({ data: { value: "enabled" }, error: null });
    const { isIpressEnabled } = await import("@/lib/ipress-config");
    expect(await isIpressEnabled()).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test — verify it fails**

```bash
npx vitest run __tests__/lib/ipress-config.test.ts
```

Expected: `Cannot find module '@/lib/ipress-config'`

- [ ] **Step 3: Create `lib/ipress-config.ts`**

```typescript
import { createClient } from "@supabase/supabase-js";

export type IpressMode = "disabled" | "enabled";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

export async function getIpressMode(): Promise<IpressMode> {
  const { data } = await adminClient()
    .schema("medical")
    .from("system_config")
    .select("value")
    .eq("key", "ipress_mode")
    .single();
  return (data?.value as IpressMode) ?? "disabled";
}

export async function isIpressEnabled(): Promise<boolean> {
  return (await getIpressMode()) === "enabled";
}
```

- [ ] **Step 4: Run the test — verify it passes**

```bash
npx vitest run __tests__/lib/ipress-config.test.ts
```

Expected: all 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/ipress-config.ts __tests__/lib/ipress-config.test.ts
git commit -m "feat: add ipress-config helper (getIpressMode, isIpressEnabled)"
```

---

## Task 3: `app/api/ehr/generate-pdf/route.ts` (include `ipress_mode` in config)

**Files:**
- Modify: `app/api/ehr/generate-pdf/route.ts:20-33`

- [ ] **Step 1: Update `getIpress()` to return `ipress_mode`**

Replace the existing `getIpress()` function (lines 20–34):

```typescript
async function getIpress(admin: ReturnType<typeof adminClient>) {
  const { data } = await admin
    .schema("medical")
    .from("system_config")
    .select("key, value");

  const cfg = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  return {
    ipress_mode:     (cfg.ipress_mode     ?? "disabled") as "disabled" | "enabled",
    ipress_name:     cfg.ipress_name     ?? "Organnical Salud S.A.C.",
    ipress_code:     cfg.ipress_code     ?? "PENDIENTE",
    ipress_ruc:      cfg.ipress_ruc      ?? "—",
    ipress_address:  cfg.ipress_address  ?? "—",
    ipress_category: cfg.ipress_category ?? "I-1",
  };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors related to `ipress_mode`.

- [ ] **Step 3: Commit**

```bash
git add app/api/ehr/generate-pdf/route.ts
git commit -m "feat(pdf): pass ipress_mode from system_config to PDF generator"
```

---

## Task 4: `lib/pdf/PrescriptionPDF.tsx` (conditional header and footer)

**Files:**
- Modify: `lib/pdf/PrescriptionPDF.tsx`

- [ ] **Step 1: Add `ipress_mode` to `PrescriptionPDFData` type**

In `lib/pdf/PrescriptionPDF.tsx`, update the type at line 69:

```typescript
export type PrescriptionPDFData = {
  // Modo
  ipress_mode:     "disabled" | "enabled";
  // IPRESS
  ipress_name:     string;
  ipress_code:     string;
  ipress_ruc:      string;
  ipress_address:  string;
  ipress_category: string;
  // Médico
  doctor_name:     string;
  doctor_cmp:      string;
  doctor_specialty: string;
  doctor_rne?:     string;
  // Paciente
  patient_name:    string;
  patient_dni:     string;
  hc_number:       string;
  // Receta
  prescription_number: string;
  issued_at:           string;
  valid_until:         string;
  diagnosis_cie10?:    string;
  diagnosis_label?:    string;
  items:               PrescriptionItem[];
  signed_hash?:        string;
};
```

- [ ] **Step 2: Replace the header `<View style={s.headerRow}>` block**

Find the existing header (lines 117–129) and replace the left side of the `<View style={s.headerRow}>`:

```tsx
{/* ── Encabezado ── */}
<View style={s.headerRow}>
  {data.ipress_mode === "enabled" ? (
    <View>
      <Text style={s.ipressName}>{data.ipress_name}</Text>
      <Text style={s.ipressSub}>{data.ipress_address}</Text>
      <Text style={s.ipressSub}>RUC: {data.ipress_ruc}  ·  Código: {data.ipress_code}  ·  Categoría {data.ipress_category}</Text>
    </View>
  ) : (
    <View>
      <Text style={s.ipressName}>Dr(a). {data.doctor_name}</Text>
      <Text style={s.ipressSub}>CMP {data.doctor_cmp}{data.doctor_rne ? `  ·  RNE ${data.doctor_rne}` : ""}</Text>
      <Text style={s.ipressSub}>{data.doctor_specialty}  ·  Lima, Perú</Text>
    </View>
  )}
  <View style={s.rxBox}>
    <Text style={s.rxLabel}>N° Receta</Text>
    <Text style={s.rxNumber}>{data.prescription_number}</Text>
    <Text style={[s.ipressSub, { marginTop: 4 }]}>Emitida: {issuedDate}</Text>
  </View>
</View>
```

- [ ] **Step 3: Replace the footer `<View style={s.footer}>` block**

Find the footer (lines 242–247) and replace:

```tsx
{/* ── Footer ── */}
<View style={s.footer} fixed>
  <Text style={s.footerText}>
    {data.ipress_mode === "enabled"
      ? `${data.ipress_name}  ·  ${data.ipress_code}  ·  Ley 30681 — Cannabis Medicinal Perú`
      : `Organnical Salud S.A.C.  ·  RUC 20607170615  ·  Ley 30681 — Cannabis Medicinal Perú`}
  </Text>
  <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
</View>
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors. The `generate-pdf` route passes `ipress_mode` from `getIpress()` which already returns it (Task 3).

- [ ] **Step 5: Commit**

```bash
git add lib/pdf/PrescriptionPDF.tsx
git commit -m "feat(pdf): PrescriptionPDF conditional header/footer based on ipress_mode"
```

---

## Task 5: `lib/pdf/EncounterPDF.tsx` (same conditional changes)

**Files:**
- Modify: `lib/pdf/EncounterPDF.tsx`

- [ ] **Step 1: Add `ipress_mode` to `EncounterPDFData` type**

In `lib/pdf/EncounterPDF.tsx`, update the `EncounterPDFData` type (line 71) to add `ipress_mode` as the first field:

```typescript
export type EncounterPDFData = {
  // Modo
  ipress_mode:     "disabled" | "enabled";
  // IPRESS
  ipress_name:     string;
  ipress_code:     string;
  ipress_ruc:      string;
  ipress_address:  string;
  ipress_category: string;
  // Médico
  doctor_name:     string;
  doctor_cmp:      string;
  doctor_specialty: string;
  doctor_rne?:     string;
  // Paciente
  patient_name:    string;
  patient_dni:     string;
  patient_birth:   string;
  patient_gender:  string;
  hc_number:       string;
  // Encuentro
  appointment_date: string;
  chief_complaint:  string;
  illness_history:  string;
  relevant_history?: string;
  vital_weight_kg?:    number;
  vital_height_cm?:    number;
  vital_bmi?:          number;
  vital_bp_systolic?:  number;
  vital_bp_diastolic?: number;
  vital_heart_rate?:   number;
  vital_respiratory_rate?: number;
  vital_temperature_c?: number;
  vital_spo2_pct?:     number;
  physical_exam_notes?: string;
  diagnoses:           DiagnosisItem[];
  treatment_plan:      string;
  indications?:        string;
  follow_up_days?:     number;
  lab_orders?:         string;
  cannabis_indication?: string;
  expected_outcomes?:   string;
  // Firma
  signed_at:            string;
  doctor_signature_hash: string;
};
```

- [ ] **Step 2: Replace the header block (lines 173–185)**

Find the `{/* ── Encabezado IPRESS ── */}` comment and replace the block:

```tsx
{/* ── Encabezado ── */}
<View style={s.headerRow}>
  {data.ipress_mode === "enabled" ? (
    <View>
      <Text style={s.ipressName}>{data.ipress_name}</Text>
      <Text style={s.ipressSub}>{data.ipress_address}</Text>
      <Text style={s.ipressSub}>RUC: {data.ipress_ruc}  ·  Código IPRESS: {data.ipress_code}  ·  Categoría {data.ipress_category}</Text>
    </View>
  ) : (
    <View>
      <Text style={s.ipressName}>Dr(a). {data.doctor_name}</Text>
      <Text style={s.ipressSub}>CMP {data.doctor_cmp}{data.doctor_rne ? `  ·  RNE ${data.doctor_rne}` : ""}</Text>
      <Text style={s.ipressSub}>{data.doctor_specialty}  ·  Lima, Perú</Text>
    </View>
  )}
  <View style={s.hcBox}>
    <Text style={s.hcLabel}>N° Historia Clínica</Text>
    <Text style={s.hcNumber}>{data.hc_number}</Text>
    <Text style={[s.ipressSub, { marginTop: 4 }]}>Atención: {data.appointment_date}</Text>
  </View>
</View>
```

- [ ] **Step 3: Replace the footer block (lines 306–311)**

```tsx
<View style={s.footer} fixed>
  <Text style={s.footerText}>
    {data.ipress_mode === "enabled"
      ? `${data.ipress_name}  ·  ${data.ipress_code}  ·  Conforme NTS 139-MINSA/2018`
      : `Organnical Salud S.A.C.  ·  RUC 20607170615  ·  Conforme NTS 139-MINSA/2018`}
  </Text>
  <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
</View>
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors. The `generate-pdf` route spreads `...ipress` (which now includes `ipress_mode`) into both `pdfData` objects.

- [ ] **Step 5: Commit**

```bash
git add lib/pdf/EncounterPDF.tsx
git commit -m "feat(pdf): EncounterPDF conditional header/footer based on ipress_mode"
```

---

## Task 6: `app/api/verificar-receta/route.ts` (conditional `ipress_code`)

**Files:**
- Modify: `app/api/verificar-receta/route.ts`

- [ ] **Step 1: Add import and make `ipress_code` conditional**

Replace the entire file content:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { isIpressEnabled } from "@/lib/ipress-config";

function adminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`verificar-receta:${ip}`, 30, 60 * 1000)) {
    return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  }

  const numero = req.nextUrl.searchParams.get("numero")?.trim().toUpperCase();
  if (!numero) return NextResponse.json({ error: "Número de receta requerido" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  const admin = adminClient();

  const { data: rx } = await admin
    .schema("medical")
    .from("prescriptions")
    .select("id, prescription_number, issued_at, valid_until, diagnosis_cie10, doctor_id")
    .eq("prescription_number", numero)
    .single();

  if (!rx) return NextResponse.json({ found: false });

  const now = new Date();
  const validUntil = new Date(rx.valid_until);
  const status = validUntil >= now ? "VÁLIDA" : "VENCIDA";

  if (!isAuthenticated) {
    return NextResponse.json({
      found: true,
      prescription_number: rx.prescription_number,
      status,
    });
  }

  const [doctorRes, ipressEnabled] = await Promise.all([
    admin.schema("medical").from("profiles")
      .select("full_name, cmp, specialty_label")
      .eq("id", rx.doctor_id)
      .single(),
    isIpressEnabled(),
  ]);

  const response: Record<string, unknown> = {
    found: true,
    prescription_number: rx.prescription_number,
    issued_at: rx.issued_at,
    valid_until: rx.valid_until,
    status,
    doctor_name: doctorRes.data?.full_name ?? "—",
    doctor_cmp: doctorRes.data?.cmp ?? "—",
    doctor_specialty: doctorRes.data?.specialty_label ?? "—",
    diagnosis_cie10: rx.diagnosis_cie10 ?? null,
  };

  if (ipressEnabled) {
    const { data: ipressData } = await admin.schema("medical").from("system_config")
      .select("value").eq("key", "ipress_code").single();
    response.ipress_code = ipressData?.value ?? "—";
  }

  return NextResponse.json(response);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/verificar-receta/route.ts
git commit -m "feat(api): verificar-receta only returns ipress_code when IPRESS mode is enabled"
```

---

## Task 7: Admin IPRESS page — Modo Light banner + toggle

**Files:**
- Modify: `app/dashboard/admin/ipress/actions.ts`
- Modify: `app/dashboard/admin/ipress/page.tsx`

- [ ] **Step 1: Add toggle actions to `actions.ts`**

Append to the end of `app/dashboard/admin/ipress/actions.ts`:

```typescript
export async function activateIpressMode() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { data: profile } = await supabase
    .schema("medical")
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Solo administradores" };

  // Verify IPRESS code is configured before activating
  const admin = adminClient();
  const { data: codeRow } = await admin
    .schema("medical")
    .from("system_config")
    .select("value")
    .eq("key", "ipress_code")
    .single();

  if (!codeRow?.value || ["PENDIENTE", ""].includes(codeRow.value)) {
    return { error: "Debes configurar el código IPRESS antes de activar el modo IPRESS" };
  }

  const { error } = await admin
    .schema("medical")
    .from("system_config")
    .upsert({ key: "ipress_mode", value: "enabled", updated_at: new Date().toISOString() }, { onConflict: "key" });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/ipress");
  return { success: true };
}

export async function deactivateIpressMode() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { data: profile } = await supabase
    .schema("medical")
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Solo administradores" };

  const admin = adminClient();
  const { error } = await admin
    .schema("medical")
    .from("system_config")
    .upsert({ key: "ipress_mode", value: "disabled", updated_at: new Date().toISOString() }, { onConflict: "key" });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/ipress");
  return { success: true };
}
```

- [ ] **Step 2: Update `page.tsx` to fetch `ipress_mode` and render the banner**

In `app/dashboard/admin/ipress/page.tsx`, make the following changes:

**2a. Add `'ipress_mode'` to the system_config query** — after the existing `CONFIG_KEYS` query, add a separate fetch for `ipress_mode`:

At the top of `AdminIpressPage()`, after the `rows` query, add:

```typescript
const { data: modeRow } = await supabase
  .schema("medical")
  .from("system_config")
  .select("value")
  .eq("key", "ipress_mode")
  .single();

const ipressMode = (modeRow?.value ?? "disabled") as "disabled" | "enabled";
```

**2b. Import the new actions** at the top of `page.tsx`:

```typescript
import { activateIpressMode, deactivateIpressMode } from "./actions";
```

**2c. Replace the `{!isConfigured && ...}` and `{isConfigured && ...}` banners** with mode-aware banners:

```tsx
{/* Mode status banner */}
{ipressMode === "disabled" ? (
  <div className="mb-6 rounded-2xl border border-sky-200 bg-sky-50 p-4 flex gap-3">
    <ShieldCheck className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
    <div>
      <p className="text-sm font-semibold text-sky-800">Modo Light activo</p>
      <p className="text-xs text-sky-600 mt-0.5">
        Las recetas se emiten bajo CMP del médico con formato <span className="font-mono">ORG-YYYY-000001</span>.
        Los documentos PDF muestran los datos del médico, no el código IPRESS.
        Activa el Modo IPRESS cuando tengas la certificación SUSALUD.
      </p>
    </div>
  </div>
) : (
  <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex gap-3">
    <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
    <div>
      <p className="text-sm font-semibold text-emerald-800">Modo IPRESS activo — {config.ipress_category}</p>
      <p className="text-xs text-emerald-600 mt-0.5">Código: <span className="font-mono">{config.ipress_code}</span></p>
    </div>
  </div>
)}
```

**2d. Add the toggle form below the existing `<IpressForm>` card:**

```tsx
{/* Toggle mode */}
<div className="mt-6 bg-white rounded-2xl border border-zinc-100 p-6">
  <h2 className="text-sm font-semibold text-zinc-700 mb-1">
    {ipressMode === "disabled" ? "Activar modo IPRESS" : "Desactivar modo IPRESS"}
  </h2>
  <p className="text-xs text-zinc-400 mb-4">
    {ipressMode === "disabled"
      ? "Requiere que el código IPRESS esté configurado arriba. Desde este momento las nuevas recetas usarán el formato de numeración IPRESS."
      : "Cambiará el formato de las nuevas recetas a ORG-YYYY-000001. Las recetas ya emitidas no se modifican."}
  </p>
  <form action={ipressMode === "disabled" ? activateIpressMode : deactivateIpressMode}>
    <button
      type="submit"
      disabled={ipressMode === "disabled" && (!isConfigured)}
      className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      style={{ background: ipressMode === "disabled"
        ? "linear-gradient(135deg, #7C3AED, #A78BFA)"
        : "#6B7280" }}
    >
      {ipressMode === "disabled" ? "Activar modo IPRESS" : "Volver a modo Light"}
    </button>
  </form>
</div>
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/admin/ipress/actions.ts app/dashboard/admin/ipress/page.tsx
git commit -m "feat(admin): ipress mode banner + activate/deactivate toggle"
```

---

## Task 8: Marketing — remove IPRESS reference from FAQ

**Files:**
- Modify: `app/(marketing)/preguntas-frecuentes/page.tsx:44`

- [ ] **Step 1: Update the FAQ answer**

Find line 44 in `app/(marketing)/preguntas-frecuentes/page.tsx`:

```typescript
a: "Sí. Las recetas emitidas en Organnical tienen firma digital del médico, número correlativo oficial, CMP y RNE del médico, y sello de la IPRESS. Son válidas en cualquier farmacia del Perú.",
```

Replace with:

```typescript
a: "Sí. Las recetas emitidas en Organnical tienen firma digital del médico, número correlativo oficial, y CMP y RNE del médico. Son válidas en cualquier farmacia del Perú.",
```

- [ ] **Step 2: Verify TypeScript compiles and run all tests**

```bash
npx tsc --noEmit && npx vitest run
```

Expected: no type errors, all tests pass.

- [ ] **Step 3: Commit**

```bash
git add "app/(marketing)/preguntas-frecuentes/page.tsx"
git commit -m "fix(marketing): remove IPRESS reference from FAQ"
```

---

## Verification Checklist

### Modo Light (default after migration)

- [ ] Create a new patient account → HC number assigns successfully (no IPRESS gate)
- [ ] Book an appointment and doctor generates a prescription → number format `ORG-2026-XXXXXX`
- [ ] Generate prescription PDF → header shows doctor name, CMP, specialty (no IPRESS block)
- [ ] Generate encounter PDF → header shows doctor name, CMP (no IPRESS block)
- [ ] `GET /api/verificar-receta?numero=ORG-2026-000001` → `{found: true, status: "VÁLIDA"}` (unauthenticated)
- [ ] Same request authenticated → response includes doctor info but no `ipress_code` field
- [ ] Admin opens `/dashboard/admin/ipress` → sees sky blue "Modo Light activo" banner
- [ ] "Activar modo IPRESS" button is disabled when `ipress_code = "PENDIENTE"`

### Modo IPRESS (after filling in IPRESS code + activating)

- [ ] Admin fills in IPRESS code (e.g., `TEST-001`) → saves successfully
- [ ] "Activar modo IPRESS" button becomes enabled
- [ ] Admin clicks "Activar modo IPRESS" → banner changes to emerald "Modo IPRESS activo"
- [ ] New prescription → number format `TEST-001-2026-000001`
- [ ] PDF header shows IPRESS name, address, code, category
- [ ] Authenticated verificar-receta → response includes `ipress_code`

### Regression

- [ ] `npx vitest run` — all tests pass
- [ ] `npx tsc --noEmit` — no type errors
- [ ] Existing appointments unaffected
- [ ] Consents, SOAP, CIE-10 flows unchanged
