import { Leaf, ShieldCheck, FlaskConical, Sparkles } from "lucide-react"

/**
 * Sección 10 — Footer pre-cierre.
 *
 * Repite los 4 trust badges + links a tienda, blog, WhatsApp.
 * Disclaimer textual obligatorio (compliance §8 del spec): "No reemplaza una
 * dieta balanceada ni la indicación médica" + link al libro de reclamaciones.
 */
const ORGANNICAL = "https://organnical.pe"

const TRUST = [
  { icon: Leaf, label: "Vegan Verified" },
  { icon: ShieldCheck, label: "Registro Sanitario M5828924N" },
  { icon: FlaskConical, label: "Análisis IIN 2025" },
  { icon: Sparkles, label: "100% peruana" },
] as const

export default function SpirusolFooter() {
  return (
    <footer
      className="pt-16 pb-10"
      style={{
        background: "var(--brand-green-900)",
        color: "var(--brand-cream)",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Trust badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10 pb-10 border-b border-white/10">
          {TRUST.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5">
              <Icon size={18} className="opacity-70 flex-shrink-0" />
              <span className="text-xs font-medium opacity-80">{label}</span>
            </div>
          ))}
        </div>

        {/* Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-3">Comprar</p>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={`${ORGANNICAL}/tienda?marca=spirusol&utm_source=spirusol_subdomain&utm_medium=footer`}
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  Tienda Spirusol
                </a>
              </li>
              <li>
                <a
                  href={`${ORGANNICAL}/productos/spirusol-en-polvo?utm_source=spirusol_subdomain&utm_medium=footer`}
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  Espirulina en Polvo
                </a>
              </li>
              <li>
                <a
                  href={`${ORGANNICAL}/productos/spirusol-crunchie?utm_source=spirusol_subdomain&utm_medium=footer`}
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  Espirulina Crunchie
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-3">Aprender</p>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={`${ORGANNICAL}/blog?tag=espirulina&utm_source=spirusol_subdomain&utm_medium=footer`}
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href={`${ORGANNICAL}/consulta-express?utm_source=spirusol_subdomain&utm_medium=footer`}
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  Consulta médica
                </a>
              </li>
              <li>
                <a href="#" className="opacity-80 hover:opacity-100 transition-opacity">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-3">Contacto</p>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://wa.me/51952476574?text=Hola%2C%20quiero%20saber%20sobre%20Spirusol"
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  WhatsApp +51 952 476 574
                </a>
              </li>
              <li>
                <a
                  href={`${ORGANNICAL}/libro-de-reclamaciones`}
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  Libro de reclamaciones
                </a>
              </li>
              <li>
                <a
                  href={`${ORGANNICAL}/contacto`}
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  Contacto Organnical
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer obligatorio §8 */}
        <p
          className="text-xs leading-relaxed opacity-50 mb-6 max-w-3xl"
          style={{ lineHeight: 1.7 }}
        >
          Spirusol es un alimento. Los valores nutricionales son referenciales y derivados del Informe IIN N° 000114-2025. No reemplaza una dieta balanceada ni la indicación médica. Para asesoría personalizada, consulta con un médico de Organnical. Producido por Greenner SAC, Moquegua, Perú. Comercializado por Organnical.
        </p>

        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 text-xs opacity-50">
          <p>© {new Date().getFullYear()} Organnical · Spirusol es marca de Greenner SAC.</p>
          <p>
            <a href={`${ORGANNICAL}/terminos`} className="hover:opacity-100 transition-opacity">Términos</a>
            <span className="mx-2">·</span>
            <a href={`${ORGANNICAL}/privacidad`} className="hover:opacity-100 transition-opacity">Privacidad</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
