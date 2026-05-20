import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const dni = req.nextUrl.searchParams.get("dni")?.trim() ?? "";
  if (!/^\d{8}$/.test(dni)) {
    return NextResponse.json({ error: "DNI inválido" }, { status: 400 });
  }

  const token = process.env.RENIEC_API_TOKEN;
  if (!token) {
    // Sin token configurado — simplemente confirmar formato válido
    return NextResponse.json({ valid: true, nombres: null });
  }

  try {
    const res = await fetch(`https://api.apis.net.pe/v2/reniec/dni?numero=${dni}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
    });

    if (res.status === 404) {
      return NextResponse.json({ valid: false, error: "DNI no encontrado en RENIEC" });
    }
    if (!res.ok) {
      return NextResponse.json({ valid: true, nombres: null }); // no bloquear por error externo
    }

    const data = await res.json() as {
      nombres?: string;
      apellidoPaterno?: string;
      apellidoMaterno?: string;
    };

    const nombreCompleto = [data.nombres, data.apellidoPaterno, data.apellidoMaterno]
      .filter(Boolean).join(" ");

    return NextResponse.json({ valid: true, nombres: nombreCompleto || null });
  } catch {
    // Timeout u otro error de red — no bloquear el flujo
    return NextResponse.json({ valid: true, nombres: null });
  }
}
