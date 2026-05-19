import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { createPreference } from "@/lib/mercadopago"
import { isPickup, MP_MIN_AMOUNT } from "@/lib/pricing"
import { calculateDeliveryCostAsync } from "@/lib/delivery-rates"
import { rateLimit, getClientIp, tooManyRequestsResponse } from "@/lib/rate-limit"
import { getStockBySkus, validateStock } from "@/lib/inventory"
import { isValidCelular, isValidDni } from "@/lib/validators"
import type { CartItem, DireccionEntrega, PublicProduct } from "@/lib/types"

interface CartItemInput {
  sku: string
  cantidad: number
}

const MAX_QTY_PER_ITEM = 50

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const rl = await rateLimit("create-preference", ip, 10, "60 s")
    if (!rl.ok) return tooManyRequestsResponse(rl.reset)

    const body = await request.json()
    const { items, direccion } = body as {
      items: CartItemInput[]
      direccion: DireccionEntrega
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Carrito vacío" }, { status: 400 })
    }

    const requiredAddressLine = !isPickup(direccion?.distrito)
    if (
      !direccion?.email ||
      !direccion?.nombre ||
      !direccion?.distrito ||
      (requiredAddressLine && !direccion?.direccion)
    ) {
      return NextResponse.json({ error: "Datos de entrega incompletos" }, { status: 400 })
    }

    if (!direccion.celular || !isValidCelular(direccion.celular)) {
      return NextResponse.json(
        { error: "El celular debe empezar con 9 y tener 9 dígitos en total." },
        { status: 400 }
      )
    }
    if (direccion.dni && !isValidDni(direccion.dni)) {
      return NextResponse.json(
        { error: "El DNI debe tener 8 dígitos." },
        { status: 400 }
      )
    }
    for (const item of items) {
      if (!item?.sku || typeof item.sku !== "string") {
        return NextResponse.json({ error: "SKU inválido" }, { status: 400 })
      }
      const qty = Number(item.cantidad)
      if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_ITEM) {
        return NextResponse.json(
          { error: `Cantidad inválida para ${item.sku} (máx. ${MAX_QTY_PER_ITEM})` },
          { status: 400 }
        )
      }
    }

    const supabase = createAdminClient()

    const skus = items.map((i) => i.sku)
    const { data: productos, error: pError } = await supabase
      .from("productos")
      .select(
        "id, sku, descripcion, descripcion_corta, descripcion_larga, ingredientes, modo_uso, advertencias, presentacion, categoria, precio_publico, precio_oferta, slug_publico, imagen_url, imagenes_galeria, tags, peso_g"
      )
      .in("sku", skus)
      .eq("visible_publico", true)
      .eq("activo", true)

    if (pError) {
      console.error("create-preference: productos query error:", pError)
      return NextResponse.json({ error: "Error consultando catálogo" }, { status: 500 })
    }

    const productosBySku = new Map<string, PublicProduct>()
    for (const p of (productos as PublicProduct[]) ?? []) {
      productosBySku.set(p.sku, p)
    }

    const missing = items.filter((i) => !productosBySku.has(i.sku))
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Productos no disponibles: ${missing.map((m) => m.sku).join(", ")}` },
        { status: 400 }
      )
    }

    const stockMap = await getStockBySkus(supabase, skus)
    const stockErrors = validateStock(
      items.map((i) => ({
        sku: i.sku,
        cantidad: i.cantidad,
        descripcion: productosBySku.get(i.sku)?.descripcion,
      })),
      stockMap
    )
    if (stockErrors.length > 0) {
      const detalle = stockErrors
        .map((e) => `${e.descripcion ?? e.sku} (pediste ${e.pedido}, quedan ${e.disponible})`)
        .join(", ")
      return NextResponse.json(
        { error: `Stock insuficiente: ${detalle}` },
        { status: 400 }
      )
    }

    const cartItems: CartItem[] = items.map((i) => ({
      producto: productosBySku.get(i.sku)!,
      cantidad: i.cantidad,
    }))

    const subtotal = cartItems.reduce((acc, item) => {
      const unitPrice = item.producto.precio_oferta ?? item.producto.precio_publico
      return acc + unitPrice * item.cantidad
    }, 0)
    const deliveryCost = await calculateDeliveryCostAsync(subtotal, direccion.distrito)
    const total = subtotal + deliveryCost

    if (total < MP_MIN_AMOUNT) {
      return NextResponse.json(
        { error: `Monto total (S/ ${total.toFixed(2)}) es menor al mínimo aceptado por la pasarela (S/ ${MP_MIN_AMOUNT.toFixed(2)}).` },
        { status: 400 }
      )
    }

    const { data: cliente } = await supabase
      .from("clientes_tienda")
      .upsert(
        {
          email: direccion.email,
          nombre: direccion.nombre,
          apellido: direccion.apellido,
          celular: direccion.celular,
          dni: direccion.dni || null,
        },
        { onConflict: "email", ignoreDuplicates: false }
      )
      .select("id")
      .single()

    const { data: orden, error: ordenError } = await supabase
      .from("ordenes_tienda")
      .insert({
        cliente_id: cliente?.id ?? null,
        cliente_snapshot: direccion as unknown as Record<string, unknown>,
        items: cartItems as unknown as Record<string, unknown>[],
        subtotal,
        delivery: deliveryCost,
        total,
        estado: "pendiente",
        direccion: direccion as unknown as Record<string, unknown>,
      })
      .select("id")
      .single()

    if (ordenError || !orden) {
      console.error("create-preference: orden insert error:", ordenError)
      return NextResponse.json({ error: "Error al crear la orden" }, { status: 500 })
    }

    const preference = await createPreference(cartItems, direccion, orden.id, deliveryCost)

    await supabase
      .from("ordenes_tienda")
      .update({ mp_preference_id: preference.id })
      .eq("id", orden.id)

    const response = NextResponse.json({
      orden_id: orden.id,
      preference_id: preference.id,
      init_point: preference.init_point,
      subtotal,
      delivery: deliveryCost,
      total,
    })
    response.cookies.set({
      name: "last_orden_id",
      value: orden.id,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60,
    })
    return response
  } catch (err) {
    const detail =
      err instanceof Error
        ? { message: err.message, cause: (err as { cause?: unknown }).cause }
        : err
    console.error("create-preference: unexpected error:", JSON.stringify(detail, null, 2))
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
