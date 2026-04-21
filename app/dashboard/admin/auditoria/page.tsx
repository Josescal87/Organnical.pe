export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import { ShieldCheck } from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
  view:       "bg-zinc-100 text-zinc-600",
  create:     "bg-blue-50 text-blue-700",
  update:     "bg-amber-50 text-amber-700",
  sign:       "bg-emerald-50 text-emerald-700",
  download:   "bg-violet-50 text-violet-700",
  delete:     "bg-red-50 text-red-600",
};

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string; resource?: string }>;
}) {
  const sp = await searchParams;
  const page     = Math.max(1, parseInt(sp.page ?? "1", 10));
  const pageSize = 50;
  const offset   = (page - 1) * pageSize;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const role = user.user_metadata?.role;
  if (role !== "admin") redirect("/dashboard/medico");

  let query = supabase
    .schema("medical")
    .from("audit_log")
    .select("id, event_time, actor_id, actor_role, actor_ip, action, resource_type, resource_id, patient_id, metadata", { count: "exact" })
    .order("event_time", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (sp.action)   query = query.eq("action", sp.action);
  if (sp.resource) query = query.eq("resource_type", sp.resource);

  const { data: logs, count } = await query;

  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <div className="mb-8">
        <BackLink href="/dashboard/admin/ipress" />
        <div className="flex items-start gap-3 mt-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-50 flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#A78BFA]" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black text-[#0B1D35]">Auditoría — Audit Trail</h1>
            <p className="text-xs text-zinc-400 mt-0.5">{count ?? 0} eventos totales · RM 164-2025/MINSA</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <form method="GET" className="flex gap-2 mb-5 flex-wrap">
        <select name="action" defaultValue={sp.action ?? ""}
          className="rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300">
          <option value="">Todas las acciones</option>
          {["view","create","update","sign","download","delete"].map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <select name="resource" defaultValue={sp.resource ?? ""}
          className="rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300">
          <option value="">Todos los recursos</option>
          {["clinical_encounter","clinical_encounter_draft","encounter_pdf","prescription","prescription_pdf","patient_background","consent"].map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <button type="submit"
          className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)" }}>
          Filtrar
        </button>
        {(sp.action || sp.resource) && (
          <a href="/dashboard/admin/auditoria"
            className="rounded-xl px-4 py-2 text-sm font-semibold border border-zinc-200 text-zinc-600 hover:bg-zinc-50">
            Limpiar
          </a>
        )}
      </form>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                {["Fecha/Hora", "Acción", "Recurso", "ID Recurso", "Actor", "Rol", "IP"].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-zinc-500 uppercase tracking-wide text-[10px] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {(logs ?? []).map(log => (
                <tr key={log.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-zinc-500">
                    {new Date(log.event_time).toLocaleString("es-PE", {
                      day: "2-digit", month: "2-digit", year: "2-digit",
                      hour: "2-digit", minute: "2-digit", second: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${ACTION_COLORS[log.action] ?? "bg-zinc-100 text-zinc-600"}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">{log.resource_type}</td>
                  <td className="px-4 py-3 font-mono text-zinc-400 max-w-[120px] truncate" title={log.resource_id}>{log.resource_id}</td>
                  <td className="px-4 py-3 font-mono text-zinc-400 max-w-[100px] truncate" title={log.actor_id ?? ""}>{log.actor_id?.slice(-8) ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-500">{log.actor_role ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-zinc-400 whitespace-nowrap">{log.actor_ip ?? "—"}</td>
                </tr>
              ))}
              {!logs?.length && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">Sin eventos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 mt-4 justify-center flex-wrap">
          {page > 1 && (
            <a href={`?page=${page - 1}${sp.action ? `&action=${sp.action}` : ""}${sp.resource ? `&resource=${sp.resource}` : ""}`}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold border border-zinc-200 text-zinc-600 hover:bg-zinc-50">
              ← Anterior
            </a>
          )}
          <span className="text-xs text-zinc-400">Página {page} de {totalPages}</span>
          {page < totalPages && (
            <a href={`?page=${page + 1}${sp.action ? `&action=${sp.action}` : ""}${sp.resource ? `&resource=${sp.resource}` : ""}`}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold border border-zinc-200 text-zinc-600 hover:bg-zinc-50">
              Siguiente →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
