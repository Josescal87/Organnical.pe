export type SignatureResult = {
  hash: string;
  provider: "digisign" | "sha256";
  certificate_serial: string | null;
  timestamp_rfc3161: string | null;
};

export type SignatureInput = {
  content: string;
  doctor_id: string;
  timestamp: string;
};

export interface DigitalSignatureProvider {
  sign(input: SignatureInput): Promise<SignatureResult>;
}

export async function signDocument(input: SignatureInput): Promise<SignatureResult> {
  const providerName = process.env.DIGITAL_SIGNATURE_PROVIDER ?? "sha256";

  if (providerName === "digisign" && process.env.DIGISIGN_API_KEY) {
    const { DigiSignProvider } = await import("./digisign");
    return new DigiSignProvider().sign(input);
  }

  const { Sha256Provider } = await import("./sha256-fallback");
  return new Sha256Provider().sign(input);
}
