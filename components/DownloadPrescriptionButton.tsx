"use client";

import { useState } from "react";

export default function DownloadPrescriptionButton({
  prescriptionId,
  className,
  children,
}: {
  prescriptionId: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(`/api/ehr/document/${prescriptionId}?type=prescription`);
      const data = (await res.json()) as { url?: string };
      if (data.url) window.open(data.url, "_blank");
    } catch {}
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className={className}
      style={loading ? { opacity: 0.5 } : undefined}
    >
      {children}
    </button>
  );
}
