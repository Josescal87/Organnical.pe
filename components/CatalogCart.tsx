"use client";

import { useState } from "react";
import { Package, ShoppingCart, Plus, Minus, Trash2, MessageCircle, CreditCard, AlertTriangle, X } from "lucide-react";

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";

const CATEGORY_COLORS: Record<string, string> = {
  CBD:       "bg-emerald-50 text-emerald-600",
  THC:       "bg-violet-50 text-violet-600",
  Balanced:  "bg-sky-50 text-sky-600",
  Accessory: "bg-zinc-100 text-zinc-500",
};

type Producto = { sku: string; descripcion: string; precio: number; categoria: string; requiere_receta: boolean };
type CartItem = Producto & { qty: number };

export default function CatalogCart({
  productosLibres,
  productosReceta,
}: {
  productosLibres: Producto[];
  productosReceta: Producto[];
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showWarning, setShowWarning] = useState(false);

  function addToCart(p: Producto) {
    setCart((prev) => {
      const existing = prev.find((i) => i.sku === p.sku);
      if (existing) return prev.map((i) => i.sku === p.sku ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...p, qty: 1 }];
    });
  }

  function changeQty(sku: string, delta: number) {
    setCart((prev) => prev
      .map((i) => i.sku === sku ? { ...i, qty: i.qty + delta } : i)
      .filter((i) => i.qty > 0)
    );
  }

  const total      = cart.reduce((s, i) => s + i.precio * i.qty, 0);
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const hasLibre   = cart.some((i) => !i.requiere_receta);
  const hasReceta  = cart.some((i) => i.requiere_receta);
  const isMixed    = hasLibre && hasReceta;
  const isOnlyLibre = hasLibre && !hasReceta;

  function buildWhatsAppMsg() {
    const lines = cart.map((i) => `• ${i.descripcion} ×${i.qty} — S/ ${(i.precio * i.qty).toFixed(2)}`);
    lines.push(`\nTotal: S/ ${total.toFixed(2)}`);
    const msg = `Hola, quiero solicitar los siguientes productos:\n\n${lines.join("\n")}`;
    return `https://wa.me/51952476574?text=${encodeURIComponent(msg)}`;
  }

  function handleCheckout() {
    if (isMixed) {
      setShowWarning(true);
    } else if (isOnlyLibre) {
      // TODO: redirect to online payment gateway
      window.open(buildWhatsAppMsg(), "_blank");
    } else {
      window.open(buildWhatsAppMsg(), "_blank");
    }
  }

  function ProductCard({ p }: { p: Producto }) {
    const inCart = cart.find((i) => i.sku === p.sku);
    return (
      <div className="bg-white rounded-2xl border border-zinc-100 p-5 hover:border-violet-200 hover:shadow-md transition-all flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(167,139,250,0.12)" }}>
            <Package className="w-5 h-5 text-[#A78BFA]" />
          </div>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[p.categoria] ?? "bg-zinc-100 text-zinc-500"}`}>
            {p.categoria}
          </span>
        </div>
        <h3 className="font-semibold text-sm text-[#0B1D35] mb-1 flex-1">{p.descripcion}</h3>
        <div className="flex items-center justify-between pt-3 border-t border-zinc-50 mt-3">
          <p className="font-black text-[#0B1D35]">S/ {p.precio.toFixed(2)}</p>
          {inCart ? (
            <div className="flex items-center gap-2">
              <button onClick={() => changeQty(p.sku, -1)} className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors">
                {inCart.qty === 1 ? <Trash2 className="w-3.5 h-3.5 text-zinc-500" /> : <Minus className="w-3.5 h-3.5 text-zinc-500" />}
              </button>
              <span className="text-sm font-bold text-[#0B1D35] w-4 text-center">{inCart.qty}</span>
              <button onClick={() => changeQty(p.sku, 1)} className="w-7 h-7 rounded-lg flex items-center justify-center text-white transition-opacity hover:opacity-80" style={{ background: G }}>
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button onClick={() => addToCart(p)} className="rounded-xl px-3 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-90" style={{ background: G }}>
              + Agregar
            </button>
          )}
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
            {productosReceta.map((p) => <ProductCard key={p.sku} p={p} />)}
          </div>
        </section>
      )}

      {/* Sección libres */}
      {productosLibres.length > 0 && (
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Disponibles sin receta</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {productosLibres.map((p) => <ProductCard key={p.sku} p={p} />)}
          </div>
        </section>
      )}

      {/* Cart flotante */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(167,139,250,0.12)" }}>
                <ShoppingCart className="w-4 h-4 text-[#A78BFA]" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-[#0B1D35]">{totalItems} producto{totalItems !== 1 ? "s" : ""} en tu carrito</p>
                <p className="text-xs text-zinc-400">Total: <span className="font-black text-[#0B1D35]">S/ {total.toFixed(2)}</span></p>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: isOnlyLibre ? G : "#25D366" }}
            >
              {isOnlyLibre
                ? <><CreditCard className="w-4 h-4" /> Pagar en línea</>
                : <><MessageCircle className="w-4 h-4" /> Solicitar por WhatsApp</>
              }
            </button>
          </div>
        </div>
      )}

      {/* Modal de advertencia — carrito mixto */}
      {showWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <button onClick={() => setShowWarning(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <h3 className="font-display font-black text-[#0B1D35] text-lg mb-2">Tu pedido incluye productos con receta</h3>
            <p className="text-sm text-zinc-500 mb-2">
              Uno o más productos de tu carrito requieren receta médica y no pueden procesarse por pago en línea.
            </p>
            <p className="text-sm text-zinc-500 mb-6">
              Te llevaremos a <strong className="text-[#0B1D35]">WhatsApp</strong> donde un asesor gestionará tu pedido completo.
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
