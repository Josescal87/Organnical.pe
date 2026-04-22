import Link from "next/link";
import Image from "next/image";
import { Phone } from "lucide-react";

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";

export default function Footer() {
  return (
    <footer className="bg-[#060E1A] px-6 pt-2 pb-16 text-zinc-500">
      <div className="h-px w-full mb-14 opacity-25" style={{ background: G }} />

      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-4 mb-14">
          <div className="md:col-span-1">
            <Image src="/logo-white.png" alt="organnical.pe" width={150} height={36} />
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              Clínica virtual de medicina integrativa en el Perú.
            </p>
            <div className="mt-5 flex flex-col gap-2.5 text-sm">
              <a href="https://wa.me/51952476574" className="hover:text-white transition-colors flex items-center gap-2">
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
              {[["Sueño", "/especialidades/sueno"], ["Dolor Crónico", "/especialidades/dolor-cronico"], ["Ansiedad", "/especialidades/ansiedad"], ["Salud Femenina", "/especialidades/salud-femenina"]].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-semibold text-white">Navegación</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="/#como-funciona" className="hover:text-white transition-colors">Cómo funciona</a></li>
              <li><a href="/#medicos" className="hover:text-white transition-colors">Médicos</a></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Iniciar sesión</Link></li>
              <li><Link href="/registro" className="hover:text-white transition-colors">Registrarse</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-semibold text-white">Legal</h4>
            <ul className="space-y-2.5 text-sm mb-8">
              <li><Link href="/privacidad" className="hover:text-white transition-colors">Política de privacidad</Link></li>
              <li><Link href="/terminos" className="hover:text-white transition-colors">Términos y condiciones</Link></li>
              <li><Link href="/devoluciones" className="hover:text-white transition-colors">Devoluciones</Link></li>
              <li><Link href="/preguntas-frecuentes" className="hover:text-white transition-colors">Preguntas frecuentes</Link></li>
              <li><Link href="/libro-reclamaciones" className="hover:text-white transition-colors">Libro de reclamaciones</Link></li>
            </ul>
            <h4 className="mb-3 text-sm font-semibold text-white">Medios de pago</h4>
            <div className="flex flex-wrap gap-2">
              {["Yape", "Visa", "Mastercard", "Amex"].map((p) => (
                <span key={p} className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-400">{p}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 space-y-3 text-center text-xs text-zinc-600">
          <p>
            <span className="text-zinc-500">Organical Ventures S.A.C.</span>
            {" · "}RUC 20607170615
            {" · "}Av. La Mar 750, Of. 510, Miraflores, Lima, Perú
          </p>
          <p>*Índice de satisfacción basado en encuesta interna a pacientes atendidos (n=2,400). Los resultados individuales pueden variar.</p>
          <p>Organnical es una plataforma tecnológica que facilita la conexión entre pacientes y profesionales médicos colegiados. No reemplaza la consulta médica presencial de emergencia.</p>
          <p>© 2019 – {new Date().getFullYear()} Organical Ventures S.A.C. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
