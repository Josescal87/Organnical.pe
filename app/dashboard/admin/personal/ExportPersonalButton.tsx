"use client";

import { Download } from "lucide-react";

type DoctorRow = {
  id: string;
  full_name: string | null;
  cmp: string | null;
  rne: string | null;
  specialty_label: string | null;
  document_id: string | null;
  created_at: string;
};

export default function ExportPersonalButton({ doctors }: { doctors: DoctorRow[] }) {
  function handleExport() {
    const headers = ["Nombre", "CMP", "RNE", "Especialidad", "DNI", "Fecha registro"];
    const rows = doctors.map((d) => [
      d.full_name ?? "",
      d.cmp ?? "",
      d.rne ?? "",
      d.specialty_label ?? "",
      d.document_id ?? "",
      new Date(d.created_at).toLocaleDateString("es-PE"),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `personal-medico-organnical-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100 transition-colors"
    >
      <Download className="w-3.5 h-3.5" /> Exportar CSV
    </button>
  );
}
