import { createHash } from "crypto";
import type { DigitalSignatureProvider, SignatureInput, SignatureResult } from "./provider";

// DigiSign (safesign.pe) — PSC acreditado ante INDECOPI
// Docs: https://www.safesign.pe/api-docs (requiere contrato empresarial)
export class DigiSignProvider implements DigitalSignatureProvider {
  private apiKey = process.env.DIGISIGN_API_KEY!;
  private certificateId = process.env.DIGISIGN_CERTIFICATE_ID!;
  private baseUrl = process.env.DIGISIGN_BASE_URL ?? "https://api.safesign.pe/v1";

  async sign(input: SignatureInput): Promise<SignatureResult> {
    const contentHash = createHash("sha256")
      .update(input.content)
      .digest("hex");

    const res = await fetch(`${this.baseUrl}/sign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        certificate_id: this.certificateId,
        hash: contentHash,
        hash_algorithm: "SHA256",
        reason: `Historia Clínica — médico ${input.doctor_id}`,
        timestamp: input.timestamp,
      }),
    });

    if (!res.ok) {
      // Fallback to SHA-256 if DigiSign is unavailable
      const { Sha256Provider } = await import("./sha256-fallback");
      return new Sha256Provider().sign(input);
    }

    const data = await res.json();
    return {
      hash: data.signature_hash ?? contentHash,
      provider: "digisign",
      certificate_serial: data.certificate_serial ?? null,
      timestamp_rfc3161: data.timestamp_token ?? null,
    };
  }
}
