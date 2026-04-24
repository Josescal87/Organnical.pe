import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Cookies — organnical",
  description: "Cómo organnical.pe utiliza cookies y tecnologías similares, qué tipos de cookies empleamos y cómo puedes controlarlas.",
};

export default function PoliticaCookiesPage() {
  const updated = "24 de abril de 2026";

  return (
    <main className="min-h-screen bg-white px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-[#7c6fed] hover:underline mb-8 inline-block">
          ← Volver al inicio
        </Link>

        <h1 className="text-4xl font-extrabold text-[#1a1a1a] mb-2">Política de Cookies</h1>
        <p className="text-sm text-zinc-400 mb-10">Última actualización: {updated}</p>

        <div className="prose prose-zinc max-w-none space-y-8 text-[15px] leading-relaxed text-zinc-600">

          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">1. ¿Qué son las cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo
              cuando los visitas. Se utilizan para que el sitio funcione correctamente, para recordar
              tus preferencias, y para recopilar información anónima sobre cómo se usa el sitio.
            </p>
            <p>
              Este sitio es operado por <strong>Organical Ventures S.A.C.</strong> (RUC 20607170615),
              con domicilio en Av. La Mar 750, Of. 510, Miraflores, Lima, Perú.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">2. Tipos de cookies que utilizamos</h2>

            <h3 className="text-base font-semibold text-[#1a1a1a] mt-4 mb-2">2.1 Cookies técnicas (necesarias)</h3>
            <p>
              Son imprescindibles para que el sitio funcione. Sin ellas no podrías iniciar sesión,
              mantener tu sesión activa ni completar una reserva. No requieren tu consentimiento.
            </p>
            <table className="w-full text-sm border-collapse mt-3">
              <thead>
                <tr className="bg-zinc-50">
                  <th className="text-left p-2 border border-zinc-200 font-semibold">Cookie</th>
                  <th className="text-left p-2 border border-zinc-200 font-semibold">Proveedor</th>
                  <th className="text-left p-2 border border-zinc-200 font-semibold">Finalidad</th>
                  <th className="text-left p-2 border border-zinc-200 font-semibold">Duración</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border border-zinc-200">sb-auth-token</td>
                  <td className="p-2 border border-zinc-200">Supabase</td>
                  <td className="p-2 border border-zinc-200">Mantiene la sesión de usuario autenticado</td>
                  <td className="p-2 border border-zinc-200">Sesión</td>
                </tr>
                <tr>
                  <td className="p-2 border border-zinc-200">organnical_cookie_consent</td>
                  <td className="p-2 border border-zinc-200">organnical.pe</td>
                  <td className="p-2 border border-zinc-200">Guarda tu elección sobre cookies</td>
                  <td className="p-2 border border-zinc-200">1 año</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-base font-semibold text-[#1a1a1a] mt-6 mb-2">2.2 Cookies analíticas</h3>
            <p>
              Nos ayudan a entender cómo los visitantes interactúan con el sitio: qué páginas visitan,
              cuánto tiempo permanecen, desde qué dispositivos acceden. Toda la información es anónima
              y agregada. Solo se activan si aceptas las cookies analíticas en el banner.
            </p>
            <table className="w-full text-sm border-collapse mt-3">
              <thead>
                <tr className="bg-zinc-50">
                  <th className="text-left p-2 border border-zinc-200 font-semibold">Cookie</th>
                  <th className="text-left p-2 border border-zinc-200 font-semibold">Proveedor</th>
                  <th className="text-left p-2 border border-zinc-200 font-semibold">Finalidad</th>
                  <th className="text-left p-2 border border-zinc-200 font-semibold">Duración</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border border-zinc-200">_ga</td>
                  <td className="p-2 border border-zinc-200">Google Analytics</td>
                  <td className="p-2 border border-zinc-200">Distingue usuarios únicos</td>
                  <td className="p-2 border border-zinc-200">2 años</td>
                </tr>
                <tr>
                  <td className="p-2 border border-zinc-200">_ga_*</td>
                  <td className="p-2 border border-zinc-200">Google Analytics</td>
                  <td className="p-2 border border-zinc-200">Mantiene el estado de sesión de Analytics</td>
                  <td className="p-2 border border-zinc-200">2 años</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-base font-semibold text-[#1a1a1a] mt-6 mb-2">2.3 Cookies publicitarias</h3>
            <p>
              Se utilizan para mostrar anuncios relevantes en plataformas como Google y Meta (Facebook/Instagram),
              y para medir la efectividad de nuestras campañas. Solo se activan si aceptas las cookies
              publicitarias en el banner.
            </p>
            <table className="w-full text-sm border-collapse mt-3">
              <thead>
                <tr className="bg-zinc-50">
                  <th className="text-left p-2 border border-zinc-200 font-semibold">Cookie</th>
                  <th className="text-left p-2 border border-zinc-200 font-semibold">Proveedor</th>
                  <th className="text-left p-2 border border-zinc-200 font-semibold">Finalidad</th>
                  <th className="text-left p-2 border border-zinc-200 font-semibold">Duración</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border border-zinc-200">_fbp</td>
                  <td className="p-2 border border-zinc-200">Meta (Facebook)</td>
                  <td className="p-2 border border-zinc-200">Identifica navegadores para medición de anuncios</td>
                  <td className="p-2 border border-zinc-200">90 días</td>
                </tr>
                <tr>
                  <td className="p-2 border border-zinc-200">_fbc</td>
                  <td className="p-2 border border-zinc-200">Meta (Facebook)</td>
                  <td className="p-2 border border-zinc-200">Guarda el último clic de anuncio de Facebook</td>
                  <td className="p-2 border border-zinc-200">90 días</td>
                </tr>
                <tr>
                  <td className="p-2 border border-zinc-200">IDE</td>
                  <td className="p-2 border border-zinc-200">Google DoubleClick</td>
                  <td className="p-2 border border-zinc-200">Retargeting y medición de conversiones de anuncios</td>
                  <td className="p-2 border border-zinc-200">13 meses</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">3. Cómo controlar las cookies</h2>
            <p>
              Al entrar al sitio por primera vez verás un banner de consentimiento donde puedes aceptar
              todas las cookies, rechazar las no esenciales, o personalizar tu elección. Puedes cambiar
              tus preferencias en cualquier momento borrando las cookies de tu navegador o ajustando la
              configuración de privacidad de tu dispositivo.
            </p>
            <p className="mt-3">
              Guías por navegador:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-[#7c6fed] hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-[#7c6fed] hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-[#7c6fed] hover:underline">Safari</a></li>
              <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-[#7c6fed] hover:underline">Microsoft Edge</a></li>
            </ul>
            <p className="mt-3">
              Ten en cuenta que deshabilitar ciertas cookies puede afectar el funcionamiento del sitio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">4. Cookies de terceros</h2>
            <p>
              Algunos servicios integrados en nuestro sitio pueden instalar sus propias cookies. Los
              principales son:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Google Analytics:</strong> medición de audiencia anónima. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#7c6fed] hover:underline">Política de Google</a></li>
              <li><strong>Meta Pixel:</strong> medición de efectividad de anuncios en Facebook e Instagram. <a href="https://www.facebook.com/policy.php" target="_blank" rel="noopener noreferrer" className="text-[#7c6fed] hover:underline">Política de Meta</a></li>
              <li><strong>MercadoPago:</strong> procesamiento seguro de pagos. <a href="https://www.mercadopago.com.pe/privacidad" target="_blank" rel="noopener noreferrer" className="text-[#7c6fed] hover:underline">Política de MercadoPago</a></li>
              <li><strong>Whereby:</strong> videoconsultas médicas. <a href="https://whereby.com/information/tos/privacy-policy/" target="_blank" rel="noopener noreferrer" className="text-[#7c6fed] hover:underline">Política de Whereby</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">5. Base legal</h2>
            <p>
              El uso de cookies técnicas se fundamenta en el interés legítimo para el funcionamiento
              del servicio. El uso de cookies analíticas y publicitarias se basa en tu consentimiento
              explícito, conforme a la Ley N.° 29733 (Ley de Protección de Datos Personales del Perú)
              y las directrices de la Autoridad Nacional de Protección de Datos (ANPD).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">6. Actualizaciones de esta política</h2>
            <p>
              Podemos actualizar esta política cuando cambiemos los servicios que utilizamos o por
              cambios regulatorios. La fecha de última actualización siempre aparece al inicio de
              este documento. Si los cambios son significativos, te notificaremos a través del banner
              de cookies o por correo electrónico.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">7. Contacto</h2>
            <p>
              Para cualquier consulta sobre el uso de cookies o el ejercicio de tus derechos de
              acceso, rectificación, cancelación u oposición (derechos ARCO), contacta a:
            </p>
            <ul className="list-none pl-0 mt-2 space-y-1">
              <li><strong>Email:</strong> <a href="mailto:privacidad@organnical.com" className="text-[#7c6fed] hover:underline">privacidad@organnical.com</a></li>
              <li><strong>Dirección:</strong> Av. La Mar 750, Of. 510, Miraflores, Lima, Perú</li>
            </ul>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-zinc-100 flex flex-wrap gap-4 text-sm text-[#7c6fed]">
          <Link href="/privacidad" className="hover:underline">Política de Privacidad</Link>
          <Link href="/terminos" className="hover:underline">Términos y Condiciones</Link>
          <Link href="/" className="hover:underline">Volver al inicio</Link>
        </div>
      </div>
    </main>
  );
}
