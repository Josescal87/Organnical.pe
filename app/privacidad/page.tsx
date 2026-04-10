import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidad — organnical",
  description: "Cómo Organical Ventures recopila, usa y protege tus datos personales y de salud.",
};

export default function PrivacidadPage() {
  const updated = "10 de abril de 2026";

  return (
    <main className="min-h-screen bg-white px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-[#7c6fed] hover:underline mb-8 inline-block">
          ← Volver al inicio
        </Link>

        <h1 className="text-4xl font-extrabold text-[#1a1a1a] mb-2">Política de Privacidad</h1>
        <p className="text-sm text-zinc-400 mb-10">Última actualización: {updated}</p>

        <div className="prose prose-zinc max-w-none space-y-8 text-[15px] leading-relaxed text-zinc-600">

          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">1. Responsable del tratamiento</h2>
            <p>
              <strong>Organical Ventures S.A.C.</strong>, con RUC 20607170615, con domicilio en
              Av. La Mar 750, Of. 510, Miraflores, Lima, Perú, es responsable del tratamiento de los
              datos personales recopilados a través de la plataforma <strong>organnical.pe</strong>.
            </p>
            <p>Contacto de privacidad: <a href="mailto:privacidad@organnical.com" className="text-[#7c6fed] hover:underline">privacidad@organnical.com</a></p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">2. Datos que recopilamos</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Datos de identificación:</strong> nombre, apellidos, DNI, fecha de nacimiento.</li>
              <li><strong>Datos de contacto:</strong> correo electrónico, número de teléfono.</li>
              <li><strong>Datos de salud:</strong> motivo de consulta, historial médico relevante, información proporcionada durante la teleconsulta. Estos datos son considerados datos sensibles y reciben protección reforzada.</li>
              <li><strong>Datos de pago:</strong> procesados íntegramente por terceros certificados (Visa, Mastercard). Organnical no almacena datos de tarjetas.</li>
              <li><strong>Datos técnicos:</strong> dirección IP, tipo de dispositivo, navegador, páginas visitadas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">3. Finalidades del tratamiento</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Gestionar el registro de usuarios y el acceso a la plataforma.</li>
              <li>Facilitar la conexión entre paciente y médico, incluyendo la emisión de recetas digitales.</li>
              <li>Enviar notificaciones relacionadas con citas, recordatorios y seguimiento clínico.</li>
              <li>Cumplir con obligaciones legales y regulatorias aplicables en el Perú (Ley N.° 29733 — Protección de Datos Personales).</li>
              <li>Mejorar la plataforma mediante análisis de uso agregado y anonimizado.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">4. Base legal del tratamiento</h2>
            <p>
              El tratamiento de tus datos se fundamenta en: (a) tu consentimiento explícito al momento
              del registro; (b) la ejecución del contrato de servicios de telemedicina; y (c) el
              cumplimiento de obligaciones legales.
            </p>
            <p>
              Los datos de salud solo se tratan con tu consentimiento expreso y para la prestación
              del servicio médico contratado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">5. Transferencia de datos</h2>
            <p>
              Organnical no vende ni cede tus datos personales a terceros con fines comerciales.
              Tus datos pueden ser compartidos con:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Los médicos colegiados de la plataforma, exclusivamente para la prestación del servicio.</li>
              <li>Proveedores tecnológicos (Supabase para infraestructura, Vercel para alojamiento) bajo acuerdos de tratamiento de datos.</li>
              <li>Autoridades sanitarias o judiciales, cuando la ley lo exija.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">6. Conservación de datos</h2>
            <p>
              Los datos de salud se conservan durante el tiempo mínimo exigido por la normativa
              sanitaria peruana (mínimo 5 años desde la última consulta). Los datos de cuenta se
              eliminan a solicitud del usuario, salvo obligación legal de conservación.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">7. Tus derechos (ARCO)</h2>
            <p>
              De acuerdo con la Ley N.° 29733, tienes derecho a <strong>Acceder</strong>,{" "}
              <strong>Rectificar</strong>, <strong>Cancelar</strong> y <strong>Oponerte</strong> al
              tratamiento de tus datos. Para ejercerlos, escríbenos a{" "}
              <a href="mailto:privacidad@organnical.com" className="text-[#7c6fed] hover:underline">
                privacidad@organnical.com
              </a>{" "}
              con asunto "Derechos ARCO" adjuntando copia de tu DNI. Responderemos en un plazo
              máximo de 20 días hábiles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">8. Cookies y tecnologías de seguimiento</h2>
            <p>
              Utilizamos cookies técnicas estrictamente necesarias para el funcionamiento de la
              plataforma (autenticación de sesión). No utilizamos cookies de seguimiento publicitario
              sin tu consentimiento previo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">9. Seguridad</h2>
            <p>
              Implementamos medidas técnicas y organizativas conforme al estándar del sector:
              cifrado en tránsito (TLS 1.3), cifrado en reposo, control de acceso basado en roles
              y registros de auditoría. La historia clínica es accesible únicamente al paciente
              y al médico tratante.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">10. Cambios a esta política</h2>
            <p>
              Podemos actualizar esta política periódicamente. Te notificaremos por correo
              electrónico ante cambios sustanciales. La versión vigente siempre estará disponible
              en <strong>organnical.pe/privacidad</strong>.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
