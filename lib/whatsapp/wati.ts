// WATI (wati.io) — WhatsApp Business API
// Messages must NOT include clinical data (diagnoses, medications) — logistics only

export async function sendWhatsAppTemplate(
  phone: string,
  templateName: string,
  params: string[]
): Promise<boolean> {
  const token = process.env.WATI_API_TOKEN;
  const baseUrl = process.env.WATI_BASE_URL;

  if (!token || !baseUrl) return false;

  // Normalize phone: remove spaces, ensure +51 prefix for Peru
  const normalized = phone.replace(/\s+/g, "").replace(/^0/, "+51");

  const res = await fetch(
    `${baseUrl}/api/v1/sendTemplateMessage?whatsappNumber=${encodeURIComponent(normalized)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        template_name: templateName,
        broadcast_name: templateName,
        parameters: params.map((value) => ({ name: "value", value })),
      }),
    }
  );

  return res.ok;
}
