// Smoke test e2e de fulfillPaidOrder, sin pasar por MercadoPago.
// Requiere una orden ya marcada `pagado` (estado='pagado', fulfillment_claimed_at NULL).
// Uso: npx tsx scripts/smoke-test-fulfillment.ts <ordenId>
//
// Efectos REALES: emite boleta (demo/prod según tokens), inserta fila(s) en `ventas`,
// y envía el correo a STORE_SALE_NOTIFY_EMAILS. Para no spamear a los 3 socios en la
// prueba, exportar antes: STORE_SALE_NOTIFY_EMAILS=jose@futura-farms.com
import { config } from "dotenv"
config({ path: ".env.local" })
import { fulfillPaidOrder } from "../lib/store-fulfillment"

const ordenId = process.argv[2]
if (!ordenId) {
  console.error("Uso: npx tsx scripts/smoke-test-fulfillment.ts <ordenId>")
  process.exit(1)
}

fulfillPaidOrder(ordenId)
  .then(() => {
    console.log("✅ fulfillPaidOrder OK")
    console.log("Verificar: fila(s) en `ventas`, ordenes_tienda.id_venta_ruby seteado,")
    console.log("correo recibido, y boleta (si los tokens de NubeFact son de producción).")
    process.exit(0)
  })
  .catch((e) => { console.error("❌", e); process.exit(1) })
