export const CONSENT_VERSIONS = {
  general_treatment: "v1.0",
  telemedicine:      "v1.0",
  cannabis_use:      "v1.0",
  data_processing:   "v1.0",
} as const;

export type ConsentType = keyof typeof CONSENT_VERSIONS;

export const CONSENT_TEXTS: Record<ConsentType, string> = {
  general_treatment: `Autorizo a los médicos de Organical Ventures S.A.C. a realizar las evaluaciones,
diagnósticos y tratamientos necesarios para mi atención médica, de acuerdo con las normas éticas
y legales vigentes en el Perú. Entiendo que tengo derecho a recibir información sobre mi estado de
salud y a tomar decisiones informadas sobre mi tratamiento.`,

  telemedicine: `Acepto recibir atención médica mediante teleconsulta (videollamada). Entiendo que
la telemedicina tiene limitaciones comparada con la atención presencial, y que el médico puede
recomendarme una consulta presencial si lo considera necesario. La consulta se realiza a través de
una plataforma segura y mis datos son confidenciales.`,

  cannabis_use: `Declaro haber sido informado(a) sobre el uso terapéutico de cannabis medicinal
conforme a la Ley N° 30681 y su reglamento. Entiendo que el tratamiento con cannabis medicinal
requiere prescripción médica, que los productos son de uso exclusivamente terapéutico, y que estoy
bajo supervisión médica durante el tratamiento. Me comprometo a no ceder, vender ni transferir los
productos recetados.`,

  data_processing: `Autorizo el tratamiento de mis datos personales de salud por parte de Organical
Ventures S.A.C., conforme a la Ley N° 29733 (Ley de Protección de Datos Personales). Mis datos serán
utilizados exclusivamente para mi atención médica y no serán compartidos con terceros sin mi
consentimiento, salvo obligación legal. Puedo solicitar su rectificación, cancelación u oposición
en cualquier momento.`,
};
