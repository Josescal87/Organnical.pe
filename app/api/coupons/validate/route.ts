import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.toUpperCase().trim();
  if (!code) return NextResponse.json({ valid: false, error: "Ingresa un código" });

  const validCode = process.env.EXPRESS_COUPON_CODE?.toUpperCase().trim();
  const discount = Number(process.env.EXPRESS_COUPON_DISCOUNT ?? 0);

  if (validCode && code === validCode && discount > 0) {
    return NextResponse.json({ valid: true, discount });
  }
  return NextResponse.json({ valid: false, error: "Código no válido" });
}
