"use client";

import { useState } from "react";
import { Package, ShoppingCart, Plus, Minus, Trash2, MessageCircle } from "lucide-react";

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";

const CATEGORY_COLORS: Record<string, string> = {
  CBD:       "bg-emerald-50 text-emerald-600",
  THC:       "bg-violet-50 text-violet-600",
  Balanced:  "bg-sky-50 text-sky-600",
  Accessory: "bg-zinc-100 text-zinc-500",
};

type Producto = { sku: string; descripcion: string; precio: number; categoria: string };
type CartItem = Producto & { qty: number };

export default function CatalogCart({ products }: { products: Producto[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);

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

  const total = cart.reduce((s, i) => s + i.precio * i.qty, 0);

  function buildWhatsAppMsg() {
    const lines = cart.map((i) => `• ${i.descripcion} ×${i.qty} — S/ ${(i.precio * i.qty).toFixed(2)}`);
    lines.push(`\nTotal: S/ ${total.toFixed(2)}`);
    const msg = `Hola, quiero solicitar mis productos recetados:\n\n${lines.join("\n")}`;
    return `https://wa.me/51952476574?text=${encodeURIComponent(msg)}`;
  }

  return (
    <div className="relative">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <p className="text-xs text-zinc-500">
          {products.length} producto{products.length !== 1 ? "s" : ""} disponible{products.length !== 1 ? "s" : ""} en tu receta
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => {
          const inCart = cart.find((i) => i.sku === p.sku);
          return (
            <div key={p.sku} className="bg-white rounded-2xl border border-zinc-100 p-5 hover:border-violet-200 hover:shadow-md transition-all flex flex-col">
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
          );
        })}
      </div>

      {/* Cart summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(167,139,250,0.12)" }}>
                <ShoppingCart className="w-4 h-4 text-[#A78BFA]" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-[#0B1D35]">{cart.reduce((s, i) => s + i.qty, 0)} producto{cart.reduce((s,i)=>s+i.qty,0)!==1?"s":""} en tu carrito</p>
                <p className="text-xs text-zinc-400">Total: <span className="font-black text-[#0B1D35]">S/ {total.toFixed(2)}</span></p>
              </div>
            </div>
            <a
              href={buildWhatsAppMsg()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "#25D366" }}
            >
              <MessageCircle className="w-4 h-4" />
              Solicitar por WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
