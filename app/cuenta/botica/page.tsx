import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ShieldCheck, ShoppingBag } from "lucide-react"
import LogoutButton from "@/components/LogoutButton"
import HeaderCartButton from "@/components/HeaderCartButton"
import { createClient } from "@/lib/supabase/server"
import BoticaCatalog from "./BoticaCatalog"

export const dynamic = "force-dynamic"

type ProductoRow = {
  sku: string
  descripcion: string
  precio: number
  precio_oferta: number | null
  categoria: string
  imagen_url: string | null
}

const NOISE = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")"

export default async function BoticaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: activeRxs } = await supabase
    .schema("medical")
    .from("prescriptions")
    .select("id, prescription_items(producto_sku)")
    .eq("patient_id", user.id)
    .gte("valid_until", new Date().toISOString())

  const prescribedSkus = [
    ...new Set(
      (activeRxs ?? []).flatMap((rx: { prescription_items: { producto_sku: string }[] }) =>
        rx.prescription_items.map((item) => item.producto_sku)
      )
    ),
  ]

  const { data: productos } = await supabase
    .from("productos")
    .select("sku, descripcion, precio, precio_oferta, categoria, imagen_url")
    .eq("activo", true)
    .eq("requiere_receta", true)
    .not("descripcion", "ilike", "Cita%")
    .order("descripcion")

  const hasRx = prescribedSkus.length > 0

  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>

      {/* ── Header sticky — mismo look que el dash ──────────────── */}
      <div
        className="sticky z-30"
        style={{
          top: "var(--promo-banner-h, 0px)",
          background: "linear-gradient(135deg, #0B1D35 0%, #0E2545 100%)",
        }}
      >
        {/* Noise */}
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{ backgroundImage: NOISE, backgroundRepeat: "repeat", backgroundSize: "180px 180px" }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(167,139,250,0.35) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Glow blob */}
        <div
          className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)" }}
        />

        <div className="relative max-w-5xl mx-auto px-4 pt-5 pb-5">

          {/* Fila 1: logo + nav + back */}
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logo-white.png"
                alt="Organnical"
                width={100}
                height={24}
                className="opacity-75 hover:opacity-100 transition-opacity"
              />
            </Link>
            {/* Nav central — desktop */}
            <nav className="hidden sm:flex items-center gap-5 flex-1 justify-center">
              <Link href="/cuenta" className="text-white/40 hover:text-white/70 text-xs font-medium transition-colors">Mi cuenta</Link>
              <span className="text-xs font-semibold" style={{ color: "#A78BFA" }}>Botica</span>
              <Link href="/tienda" className="text-white/40 hover:text-white/70 text-xs font-medium transition-colors">Tienda</Link>
              <Link href="/blog" className="text-white/40 hover:text-white/70 text-xs font-medium transition-colors">Blog</Link>
            </nav>
            <div className="flex items-center gap-3 flex-shrink-0">
              <HeaderCartButton variant="dark" />
              <LogoutButton />
            </div>
          </div>

          {/* Fila 2: avatar icono + título + status pill */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)" }}
            >
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl font-black text-white leading-tight">Mi Botica</h1>
              <p className="text-white/40 text-xs">
                {hasRx
                  ? `${prescribedSkus.length} producto${prescribedSkus.length !== 1 ? "s" : ""} disponible${prescribedSkus.length !== 1 ? "s" : ""} con receta`
                  : "Agrega una receta para desbloquear productos"}
              </p>
            </div>
            {hasRx ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/20 rounded-full px-3 py-1.5 flex-shrink-0">
                <ShieldCheck size={11} />
                {prescribedSkus.length} con receta
              </span>
            ) : (
              <Link
                href="/consulta-express"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white rounded-full px-3 py-1.5 flex-shrink-0 transition-opacity hover:opacity-80"
                style={{ background: "linear-gradient(135deg, #F472B6, #A78BFA)" }}
              >
                Obtener receta →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Catalog ─────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <BoticaCatalog
          allProducts={(productos ?? []) as ProductoRow[]}
          prescribedSkus={prescribedSkus}
        />
      </div>
    </div>
  )
}
