"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { ArrowLeft, ShoppingCart, Package } from "lucide-react";
import Link from "next/link";

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";

type CartItem = { sku: string; descripcion: string; precio: number; qty: number };

initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY!, { locale: "es-PE" });

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("mp_cart");
    if (!stored) { router.replace("/dashboard/paciente/catalogo"); return; }

    const items: CartItem[] = JSON.parse(stored);
    setCart(items);
    setAmount(items.reduce((s, i) => s + i.precio * i.qty, 0));

    fetch("/api/mercadopago/create-preference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.preference_id) {
          setPreferenceId(data.preference_id);
        } else {
          setError(data.error ?? "No se pudo iniciar el pago.");
        }
      })
      .catch(() => setError("Error al conectar con el servidor de pagos."))
      .finally(() => setLoading(false));
  }, [router]);

  const total = cart.reduce((s, i) => s + i.precio * i.qty, 0);

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <Link
        href="/dashboard/paciente/catalogo"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Volver al catálogo
      </Link>

      <h1 className="font-display text-2xl font-black text-[#0B1D35] mb-8">Finalizar compra</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        {/* Resumen del pedido */}
        <div className="order-2 lg:order-1">
          <div className="bg-white rounded-2xl border border-zinc-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShoppingCart className="w-4 h-4 text-[#A78BFA]" />
              <h2 className="font-bold text-sm text-[#0B1D35]">Resumen del pedido</h2>
            </div>
            <div className="space-y-3">
              {cart.map((i) => (
                <div key={i.sku} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(167,139,250,0.10)" }}
                  >
                    <Package className="w-4 h-4 text-[#A78BFA]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0B1D35] truncate">{i.descripcion}</p>
                    <p className="text-xs text-zinc-400">×{i.qty} · S/ {i.precio.toFixed(2)} c/u</p>
                  </div>
                  <p className="text-sm font-bold text-[#0B1D35] flex-shrink-0">
                    S/ {(i.precio * i.qty).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-zinc-100 mt-5 pt-4 flex justify-between items-center">
              <span className="text-sm text-zinc-500">Total</span>
              <span className="font-black text-lg text-[#0B1D35]">S/ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Brick de pago */}
        <div className="order-1 lg:order-2">
          {loading && (
            <div className="bg-white rounded-2xl border border-zinc-100 p-10 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-violet-300 border-t-violet-600 animate-spin" />
            </div>
          )}
          {error && (
            <div className="bg-red-50 rounded-2xl border border-red-100 p-6 text-center">
              <p className="text-sm text-red-600 font-medium">{error}</p>
              <Link
                href="/dashboard/paciente/catalogo"
                className="inline-block mt-4 text-xs text-zinc-500 underline"
              >
                Volver al catálogo
              </Link>
            </div>
          )}
          {preferenceId && !loading && (
            <Payment
              initialization={{ amount, preferenceId }}
              customization={{
                paymentMethods: {
                  creditCard: "all",
                  debitCard:  "all",
                },
                visual: {
                  style: {
                    customVariables: {
                      baseColor:         "#A78BFA",
                      baseColorFirstVariant: "#F472B6",
                      baseColorSecondVariant: "#38BDF8",
                    },
                  },
                },
              }}
              onSubmit={async () => {
                sessionStorage.removeItem("mp_cart");
              }}
              onError={(err) => {
                console.error("MP Brick error:", err);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
