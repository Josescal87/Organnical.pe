export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Users, AlertTriangle, Download } from "lucide-react";
import { BackLink } from "@/components/BackLink";
import ExportPersonalButton from "./ExportPersonalButton";

function adminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

type DoctorRow = {
  id: string;
  full_name: string | null;
  cmp: string | null;
  rne: string | null;
  specialty_label: string | null;
  document_id: string | null;
  created_at: string;
};

export default async function PersonalAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .schema("medical").from("profiles").select("role").eq("id", user.id).single();
  if (profileData?.role !== "admin") redirect("/dashboard");

  const admin = adminClient();
  const { data: doctors } = await admin
    .schema("medical")
    .from("profiles")
    .select("id, full_name, cmp, rne, specialty_label, document_id, created_at")
    .eq("role", "doctor")
    .order("full_name");

  const staff = (doctors ?? []) as DoctorRow[];
  const incomplete = staff.filter((d) => !d.cmp || d.cmp === "PENDIENTE");

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <div className="mb-8">
        <BackLink href="/dashboard/admin" />
        <h1 className="font-display text-2xl font-black text-[#0B1D35]">Registro de Personal Médico</h1>
        <p className="text-zinc-500 text-sm mt-1">
          {staff.length} médico{staff.length !== 1 ? "s" : ""} registrado{staff.length !== 1 ? "s" : ""} · Para inspección DIRIS
        </p>
      </div>

      {incomplete.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">{incomplete.length} médico{incomplete.length !== 1 ? "s" : ""} con CMP incompleto</p>
            <p className="text-amber-600 text-xs mt-0.5">
              {incomplete.map((d) => d.full_name ?? d.id).join(", ")} — El CMP es requerido para la inspección DIRIS y para emitir documentos clínicos válidos.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden mb-6">
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-zinc-50">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-400" />
            <span className="font-semibold text-sm text-[#0B1D35]">Personal médico activo</span>
          </div>
          <ExportPersonalButton doctors={staff} />
        </div>

        {staff.length === 0 ? (
          <div className="p-10 text-center text-zinc-400 text-sm">
            No hay médicos registrados aún.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 text-zinc-400 text-xs uppercase tracking-wide">
                  <th className="px-6 py-3 text-left font-semibold">Nombre</th>
                  <th className="px-4 py-3 text-left font-semibold">CMP</th>
                  <th className="px-4 py-3 text-left font-semibold">RNE</th>
                  <th className="px-4 py-3 text-left font-semibold">Especialidad</th>
                  <th className="px-4 py-3 text-left font-semibold">DNI</th>
                  <th className="px-4 py-3 text-left font-semibold">Registro</th>
                  <th className="px-4 py-3 text-left font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {staff.map((doc) => {
                  const ok = doc.cmp && doc.cmp !== "PENDIENTE";
                  return (
                    <tr key={doc.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-[#0B1D35]">{doc.full_name ?? "—"}</td>
                      <td className="px-4 py-3.5 font-mono text-violet-700">{doc.cmp ?? "—"}</td>
                      <td className="px-4 py-3.5 font-mono text-zinc-500">{doc.rne ?? "—"}</td>
                      <td className="px-4 py-3.5 text-zinc-600">{doc.specialty_label ?? "—"}</td>
                      <td className="px-4 py-3.5 text-zinc-500">{doc.document_id ?? "—"}</td>
                      <td className="px-4 py-3.5 text-zinc-400 text-xs">
                        {new Date(doc.created_at).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                          {ok ? "✓ Completo" : "⚠ CMP pendiente"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-zinc-50 rounded-2xl border border-zinc-100 p-5">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2 flex items-center gap-2">
          <Download className="w-3.5 h-3.5" /> Para la inspección DIRIS
        </p>
        <p className="text-xs text-zinc-400">
          Exporta el CSV con el listado completo de personal médico para adjuntar al expediente de
          inspección DIRIS Lima. El archivo incluye: nombre, CMP, RNE, especialidad y DNI de cada médico.
        </p>
      </div>
    </div>
  );
}
