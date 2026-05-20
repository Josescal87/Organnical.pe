"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, User, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import DocumentInput, { type DocType, validateDocId } from "@/components/DocumentInput";

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";

interface Props {
  userId: string;
  email: string;
  initialData: {
    full_name: string;
    document_id: string;
    document_type: string;
    phone: string;
  };
}

export default function ProfileForm({ userId, email, initialData }: Props) {
  const [fullName, setFullName] = useState(initialData.full_name);
  const [docType, setDocType] = useState<DocType>(
    (initialData.document_type as DocType) || "DNI"
  );
  const [docId, setDocId] = useState(initialData.document_id);
  const [phone, setPhone] = useState(initialData.phone);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (docId.trim()) {
      const docError = validateDocId(docType, docId.trim());
      if (docError) {
        toast.error(docError);
        return;
      }
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .schema("medical")
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        document_type: docType,
        document_id: docId.trim() || null,
        phone: phone.trim() || null,
      })
      .eq("id", userId);

    setLoading(false);
    if (updateError) {
      toast.error("No se pudo guardar. Intenta de nuevo.");
    } else {
      toast.success("Cambios guardados correctamente.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-zinc-100 p-6 md:p-8 space-y-5">
      {/* Email — read-only */}
      <div>
        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
          Correo electrónico
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
          <input
            type="email"
            value={email}
            disabled
            className="w-full rounded-xl border border-zinc-100 bg-zinc-50 pl-9 pr-4 py-3 text-sm text-zinc-400 cursor-not-allowed"
          />
        </div>
        <p className="text-xs text-zinc-400 mt-1">El correo no se puede cambiar.</p>
      </div>

      {/* Full name */}
      <div>
        <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wide mb-1.5">
          Nombre completo <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Juan Pérez Quispe"
            className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-4 py-3 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-[#A78BFA] focus:ring-2 focus:ring-[#A78BFA]/20 transition-all"
          />
        </div>
      </div>

      {/* Document */}
      <DocumentInput
        docType={docType}
        docId={docId}
        onDocTypeChange={setDocType}
        onDocIdChange={setDocId}
      />
      <p className="text-xs text-zinc-400 -mt-3">Requerido para que tu médico emita recetas oficiales.</p>

      {/* Phone */}
      <div>
        <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wide mb-1.5">
          Teléfono / WhatsApp
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="999 999 999"
            className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-4 py-3 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-[#A78BFA] focus:ring-2 focus:ring-[#A78BFA]/20 transition-all"
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
          style={{ background: G }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Guardar cambios
        </button>
      </div>
    </form>
  );
}
