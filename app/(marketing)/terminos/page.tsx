import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos y Condiciones — organnical",
  description: "Condiciones de uso de la plataforma de telemedicina Organical Ventures.",
};

export default function TerminosPage() {
  const updated = "10 de abril de 2026";

  return (
    <main className="min-h-screen bg-white px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-[#7c6fed] hover:underline mb-8 inline-block">
          ← Volver al inicio
        </Link>

        <h1 className="text-4xl font-extrabold text-[#1a1a1a] mb-2">Términos y Condiciones</h1>
        <p className="text-sm text-zinc-400 mb-10">Última actualización: {updated}</p>

        <div className="prose prose-zinc max-w-none space-y-8 text-[15px] leading-relaxed text-zinc-600">

          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">1. Identificación del prestador</h2>
            <p>
              <strong>Organical Ventures S.A.C.</strong> (en adelante, "Organnical"), con
              RUC 20607170615 y domicilio en Av. La Mar 750, Of. 510, Miraflores, Lima, Perú, opera
              la plataforma de telemedicina accesible en <strong>organnical.pe</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">2. Descripción del servicio</h2>
            <p>
              Organnical es una <strong>plataforma tecnológica de telemedicina</strong> que facilita
              la conexión entre pacientes y médicos colegiados en el Perú (CMP activo). El servicio
              incluye la agenda de teleconsultas por videollamada, el envío de documentación clínica
              digital y el seguimiento de tratamiento.
            </p>
            <p>
              Organnical <strong>no presta directamente servicios médicos</strong>. Los diagnósticos,
              tratamientos y recetas son responsabilidad exclusiva de los profesionales médicos
              colegiados que utilizan la plataforma.
            </p>
            <p>
              <strong>Este servicio no reemplaza la atención de emergencias médicas.</strong> En caso
              de emergencia llama al 106 (SIS) o acude al centro de salud más cercano.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">3. Requisitos de acceso</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Ser mayor de 18 años. Los menores de edad requieren consentimiento y presencia del tutor legal.</li>
              <li>Proporcionar información veraz al momento del registro.</li>
              <li>Contar con conexión a internet y dispositivo compatible para la videollamada.</li>
              <li>Residir o encontrarse en territorio peruano durante la consulta.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">4. Registro y cuenta de usuario</h2>
            <p>
              Al crear una cuenta aceptas proporcionar datos verídicos y mantenerlos actualizados.
              Eres responsable de la confidencialidad de tu contraseña. Organnical no se hace
              responsable de accesos no autorizados derivados de negligencia del usuario.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">5. Proceso de consulta y receta digital</h2>
            <p>
              Las teleconsultas se realizan mediante videollamada segura. Al finalizar, el médico
              puede emitir una receta digital con firma electrónica válida conforme al{" "}
              <strong>Decreto Supremo N.° 013-2020-SA</strong> y demás normas aplicables del
              Ministerio de Salud del Perú (MINSA).
            </p>
            <p>
              La receta digital es un documento médico oficial. Su uso queda sujeto a las
              restricciones legales vigentes para cada tipo de medicamento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">6. Tarifas, pagos y cancelaciones</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Las tarifas de cada consulta se muestran antes de confirmar la cita.</li>
              <li>El pago se procesa a través de pasarelas certificadas (Visa, Mastercard, Yape).</li>
              <li><strong>Política de cancelación:</strong> cancelaciones con más de 24 horas de anticipación reciben reembolso completo. Cancelaciones con menos de 24 horas no son reembolsables, salvo causa de fuerza mayor debidamente documentada.</li>
              <li>En caso de falla técnica imputable a Organnical, se reagendará la cita sin costo.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">7. Responsabilidades y limitaciones</h2>
            <p>
              Organnical no garantiza resultados médicos específicos. La efectividad de cualquier
              tratamiento depende de múltiples factores individuales y es determinada por el
              profesional médico.
            </p>
            <p>
              Organnical verifica que los médicos de la plataforma cuenten con CMP activo al momento
              de su incorporación, pero no es responsable por la actuación clínica de los profesionales
              médicos independientes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">8. Propiedad intelectual</h2>
            <p>
              Todos los contenidos de la plataforma (diseño, textos, logotipo, código) son propiedad
              de Organical Ventures S.A.C. o de sus licenciantes. Queda prohibida su reproducción
              total o parcial sin autorización expresa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">9. Ley aplicable y jurisdicción</h2>
            <p>
              Estos términos se rigen por la legislación peruana. Cualquier controversia será sometida
              a los juzgados y tribunales competentes de Lima, Perú, salvo que la normativa de
              protección al consumidor disponga un fuero distinto.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">10. Libro de reclamaciones</h2>
            <p>
              Conforme al Código de Protección y Defensa del Consumidor (Ley N.° 29571), ponemos
              a tu disposición el Libro de Reclamaciones virtual. Puedes acceder a él en{" "}
              <a
                href="https://www.indecopi.gob.pe/libro-de-reclamaciones"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7c6fed] hover:underline"
              >
                indecopi.gob.pe
              </a>{" "}
              o escribiéndonos a{" "}
              <a href="mailto:reclamos@organnical.com" className="text-[#7c6fed] hover:underline">
                reclamos@organnical.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">11. Modificaciones</h2>
            <p>
              Organnical puede modificar estos términos con previo aviso de 15 días a través del
              correo electrónico registrado. El uso continuado de la plataforma tras la entrada en
              vigor de los cambios implica su aceptación.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
