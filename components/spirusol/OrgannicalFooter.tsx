import Image from "next/image"
import { Phone } from "lucide-react"

/**
 * Footer para el subdominio Spirusol — copia visual 1:1 de `components/Footer.tsx`
 * con todos los hrefs en absoluto a `https://organnical.pe/...` + UTMs. Decisión
 * 2026-05-22 con usuario: paridad visual con la home.
 *
 * Diferencias del global:
 *   • Todos los `<Link>` reemplazados por `<a>` con href absoluto.
 *   • Disclaimer extra Spirusol (compliance §8 del spec — Ley 30021/DS 007-98-SA)
 *     antes del bloque legal de Organical Ventures.
 *
 * Si actualizas el Footer global, replicá acá las clases para mantener paridad.
 */
const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)"
const ORGANNICAL = "https://organnical.pe"
const UTM = "utm_source=spirusol_subdomain&utm_medium=footer"

export default function OrgannicalFooter() {
  return (
    <footer className="bg-[#060E1A] px-6 pt-2 pb-16 text-zinc-500">
      <div className="h-px w-full mb-14 opacity-25" style={{ background: G }} />

      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-4 mb-14">
          <div className="md:col-span-1">
            <a href={`${ORGANNICAL}/?${UTM}`}>
              <Image src="/logo-white.png" alt="organnical.pe" width={150} height={36} />
            </a>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              Plataforma de telemedicina integrativa en el Perú.
            </p>
            <div className="mt-5 flex flex-col gap-2.5 text-sm">
              <a
                href="https://wa.me/51952476574?text=Hola%2C%20vi%20Spirusol%20en%20su%20web"
                className="hover:text-white transition-colors flex items-center gap-2"
              >
                <Phone className="w-3.5 h-3.5" /> 952 476 574
              </a>
              <a href="mailto:reservas@organnical.com" className="hover:text-white transition-colors">
                reservas@organnical.com
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-semibold text-white">Especialidades</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ["Sueño", `${ORGANNICAL}/especialidades/sueno?${UTM}`],
                ["Dolor Crónico", `${ORGANNICAL}/especialidades/dolor-cronico?${UTM}`],
                ["Ansiedad", `${ORGANNICAL}/especialidades/ansiedad?${UTM}`],
                ["Salud Femenina", `${ORGANNICAL}/especialidades/salud-femenina?${UTM}`],
              ].map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="hover:text-white transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-semibold text-white">Navegación</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href={`${ORGANNICAL}/#como-funciona?${UTM}`} className="hover:text-white transition-colors">
                  Cómo funciona
                </a>
              </li>
              <li>
                <a href={`${ORGANNICAL}/#medicos?${UTM}`} className="hover:text-white transition-colors">
                  Médicos
                </a>
              </li>
              <li>
                <a href={`${ORGANNICAL}/servicios?${UTM}`} className="hover:text-white transition-colors">
                  Servicios y precios
                </a>
              </li>
              <li>
                <a
                  href={`${ORGANNICAL}/tienda?marca=spirusol&${UTM}`}
                  className="hover:text-white transition-colors"
                >
                  Tienda Spirusol
                </a>
              </li>
              <li>
                <a href={`${ORGANNICAL}/blog?${UTM}`} className="hover:text-white transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href={`${ORGANNICAL}/login?${UTM}`} className="hover:text-white transition-colors">
                  Iniciar sesión
                </a>
              </li>
              <li>
                <a href={`${ORGANNICAL}/registro?${UTM}`} className="hover:text-white transition-colors">
                  Registrarse
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-semibold text-white">Legal</h4>
            <ul className="space-y-2.5 text-sm mb-8">
              <li>
                <a href={`${ORGANNICAL}/privacidad?${UTM}`} className="hover:text-white transition-colors">
                  Política de privacidad
                </a>
              </li>
              <li>
                <a href={`${ORGANNICAL}/terminos?${UTM}`} className="hover:text-white transition-colors">
                  Términos y condiciones
                </a>
              </li>
              <li>
                <a href={`${ORGANNICAL}/devoluciones?${UTM}`} className="hover:text-white transition-colors">
                  Devoluciones
                </a>
              </li>
              <li>
                <a
                  href={`${ORGANNICAL}/preguntas-frecuentes?${UTM}`}
                  className="hover:text-white transition-colors"
                >
                  Preguntas frecuentes
                </a>
              </li>
              <li>
                <a
                  href={`${ORGANNICAL}/libro-reclamaciones?${UTM}`}
                  className="hover:text-white transition-colors"
                >
                  Libro de reclamaciones
                </a>
              </li>
              <li>
                <a
                  href={`${ORGANNICAL}/politica-cookies?${UTM}`}
                  className="hover:text-white transition-colors"
                >
                  Política de cookies
                </a>
              </li>
            </ul>
            <h4 className="mb-3 text-sm font-semibold text-white">Medios de pago</h4>
            <div className="flex flex-wrap gap-2">
              {["Yape", "Visa", "Mastercard", "Amex"].map((p) => (
                <span
                  key={p}
                  className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-400"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Disclaimer obligatorio Spirusol §8 — alimento, no producto medicinal */}
        <p className="border-t border-white/5 pt-6 text-xs leading-relaxed text-zinc-500 max-w-4xl mb-6">
          Spirusol es un alimento. Los valores nutricionales son referenciales y derivados del Informe IIN
          N° 000114-2025. No reemplaza una dieta balanceada ni la indicación médica. Producido por Greenner
          SAC, Moquegua, Perú. Comercializado por Organnical.
        </p>

        <div className="space-y-3 text-center text-xs text-zinc-600">
          <p>
            <span className="text-zinc-500">Organical Ventures S.A.C.</span>
            {" · "}RUC 20607170615
            {" · "}Av. La Mar 750, Of. 510, Miraflores, Lima, Perú
          </p>
          <p>
            *Índice de satisfacción basado en encuesta interna a pacientes atendidos (n=2,400). Los resultados
            individuales pueden variar.
          </p>
          <p>
            Organnical es una plataforma tecnológica que facilita la conexión entre pacientes y profesionales
            médicos colegiados. No reemplaza la consulta médica presencial de emergencia.
          </p>
          <p>© 2019 – {new Date().getFullYear()} Organical Ventures S.A.C. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
