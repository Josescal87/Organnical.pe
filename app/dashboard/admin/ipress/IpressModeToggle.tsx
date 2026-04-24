"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { activateIpressMode, deactivateIpressMode } from "./actions";

export function IpressModeToggle({
  currentMode,
  ipressCode,
}: {
  currentMode: "disabled" | "enabled";
  ipressCode: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDisabled = currentMode === "disabled" && (!ipressCode || ipressCode === "PENDIENTE");

  async function handleToggle() {
    setLoading(true);
    setError(null);
    const result =
      currentMode === "disabled"
        ? await activateIpressMode()
        : await deactivateIpressMode();
    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="mb-6">
      <button
        onClick={handleToggle}
        disabled={loading || isDisabled}
        className={`rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
          currentMode === "disabled" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {loading
          ? "Procesando..."
          : currentMode === "disabled"
          ? "Activar modo IPRESS"
          : "Desactivar modo IPRESS"}
      </button>
      {isDisabled && currentMode === "disabled" && (
        <p className="mt-1 text-sm text-amber-600">
          Configura el código IPRESS antes de activar.
        </p>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
