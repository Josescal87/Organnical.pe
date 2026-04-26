"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  CreditCard,
  AlertTriangle,
  X,
  ShieldAlert,
} from "lucide-react";

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";

const CATEGORY_COLORS: Record<string, string> = {
  CBD: "bg-emerald-50 text-emerald-600",
  THC: "bg-violet-50 text-violet-600",
  Balanced: "bg-sky-50 text-sky-600",
  Accessory: "bg-zinc-100 text-zinc-500",
};

type Producto = {
  sku: string;
  descripcion: string;
  descripcion_corta: string | null;
  precio: number;
  precio_oferta: number | null;
  categoria: string;
  imagen_url: string | null;
  requiere_receta: boolean;
};
type CartItem = Producto & { qty: number };

export default function CatalogCart({
  productosLibres,
  productosReceta,
}: {
  productosLibres: Producto[];
  productosReceta: Producto[];
}) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  const [loadingPay, setLoadingPay] = useState(false);

  function addToCart(p: Producto) {
    setCart((prev) => {
      const existing = prev.find((i) => i.sku === p.sku);
      if (existing)
        return prev.map((i) => (i.sku === p.sku ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...p, qty: 1 }];
    });
  }

  function changeQty(sku: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => (i.sku === sku ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  }

  const total = cart.reduce((s, i) => s + i.precio * i.qty, 0);
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const hasLibre = cart.some((i) => !i.requiere_receta);
  const hasReceta = cart.some((i) => i.requiere_receta);
  const isMixed = hasLibre && hasReceta;
  const isOnlyLibre = hasLibre && !hasReceta;

  function buildWhatsAppMsg() {
    const lines = cart.map(
      (i) => `• ${i.descripcion} ×${i.qty} — S/ ${(i.precio * i.qty).toFixed(2)}`
    );
    lines.push(`\nTotal: S/ ${total.toFixed(2)}`);
    const msg = `Hola, quiero solicitar los siguientes productos:\n\n${lines.join("\n")}`;
    return `https://wa.me/51952476574?text=${encodeURIComponent(msg)}`;
  }

  async function handleCheckout() {
    if (isMixed) {
      setShowWarning(true);
    } else if (isOnlyLibre) {
      setLoadingPay(true);
      try {
        sessionStorage.setItem(
          "mp_cart",
          JSON.stringify(
            cart.map((i) => ({
              sku: i.sku,
              descripcion: i.descripcion,
              precio: i.precio,
              qty: i.qty,
            }))
          )
        );
        router.push("/dashboard/paciente/catalogo/checkout");
      } catch {
        alert("Error al iniciar el pago.");
        setLoadingPay(false);
      }
    } else {
      window.open(buildWhatsAppMsg(), "_blank");
    }
  }

  function ProductCard({ p }: { p: Producto }) {
    const inCart = cart.find((i) => i.sku === p.sku);
    const displayPrice = p.precio_oferta ?? p.precio;

    return (
      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden hover:border-violet-200 hover:shadow-md transition-all flex flex-col">
        {/* Imagen */}
        <div className="relative aspect-square bg-[#F8FAFC] overflow-hidden">
          {p.imagen_url ? (
            <Image
              src={p.imagen_url}
              alt={p.descripcion}
              fill
              className="object-contain p-3"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl text-zinc-200">
              🌿
            </div>
          )}
          {p.requiere_receta && (
            <div className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white">
              Rx
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                CATEGORY_COLORS[p.categoria] ?? "bg-zinc-100 text-zinc-500"
              }`}
            >
              {p.categoria}
            </span>
          </div>
          <h3 className="font-semibold text-sm text-[#0B1D35] leading-snug mb-1">{p.descripcion}</h3>
          {p.descripcion_corta && (
            <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 mb-2">
              {p.descripcion_corta}
            </p>
          )}
          {p.requiere_receta && (
            <div className="flex items-center gap-1.5 mb-2 text-amber-600 bg-amber-50 rounded-lg px-2 py-1.5">
              <ShieldAlert className="w-3 h-3 flex-shrink-0" />
              <span className="text-[10px] font-semibold">Requiere receta médica</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-50 mt-auto">
            <div>
              {p.precio_oferta ? (
                <div className="flex items-baseline gap-1">
                  <span className="font-black text-[#059669] text-sm">
                    S/ {displayPrice.toFixed(2)}
                  </span>
                  <span className="text-xs text-zinc-400 line-through">
                    S/ {p.precio.toFixed(2)}
                  </span>
                </div>
              ) : (
                <p className="font-black text-[#0B1D35] text-sm">S/ {p.precio.toFixed(2)}</p>
              )}
            </div>
            {inCart ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => changeQty(p.sku, -1)}
                  className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
                >
                  {inCart.qty === 1 ? (
                    <Trash2 className="w-3.5 h-3.5 text-zinc-500" />
                  ) : (
                    <Minus className="w-3.5 h-3.5 text-zinc-500" />
                  )}
                </button>
                <span className="text-sm font-bold text-[#0B1D35] w-4 text-center">
                  {inCart.qty}
                </span>
                <button
                  onClick={() => changeQty(p.sku, 1)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white transition-opacity hover:opacity-80"
                  style={{ background: G }}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(p)}
                className="rounded-xl px-3 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-90"
                style={{ background: G }}
              >
                + Agregar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pb-32">
      {/* Sección recetados */}
      {productosReceta.length > 0 && (
        <section className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Tus productos recetados
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {productosReceta.map((p) => (
              <ProductCard key={p.sku} p={p} />
            ))}
          </div>
        </section>
      )}

      {/* Sección libres */}
      {productosLibres.length > 0 && (
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
            Disponibles sin receta
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {productosLibres.map((p) => (
              <ProductCard key={p.sku} p={p} />
            ))}
          </div>
        </section>
      )}

      {/* Cart flotante */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(167,139,250,0.12)" }}
              >
                <ShoppingCart className="w-4 h-4 text-[#A78BFA]" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-[#0B1D35]">
                  {totalItems} producto{totalItems !== 1 ? "s" : ""} en tu carrito
                </p>
                <p className="text-xs text-zinc-400">
                  Total:{" "}
                  <span className="font-black text-[#0B1D35]">S/ {total.toFixed(2)}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loadingPay}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: isOnlyLibre ? G : "#25D366" }}
            >
              {isOnlyLibre ? (
                <>
                  <CreditCard className="w-4 h-4" />{" "}
                  {loadingPay ? "Redirigiendo…" : "Pagar en línea"}
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4" /> Solicitar por WhatsApp
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Modal advertencia — carrito mixto */}
      {showWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <button
                onClick={() => setShowWarning(false)}
                className="text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <h3 className="font-display font-black text-[#0B1D35] text-lg mb-2">
              Tu pedido incluye productos con receta
            </h3>
            <p className="text-sm text-zinc-500 mb-2">
              Uno o más productos de tu carrito requieren receta médica y no pueden
              procesarse por pago en línea.
            </p>
            <p className="text-sm text-zinc-500 mb-6">
              Te llevaremos a{" "}
              <strong className="text-[#0B1D35]">WhatsApp</strong> donde un asesor
              gestionará tu pedido completo.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWarning(false)}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-zinc-600 border border-zinc-200 hover:border-zinc-300 transition-colors"
              >
                Cancelar
              </button>
              <a
                href={buildWhatsAppMsg()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowWarning(false)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "#25D366" }}
              >
                <MessageCircle className="w-4 h-4" /> Continuar
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
