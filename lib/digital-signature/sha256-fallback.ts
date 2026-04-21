import { createHash } from "crypto";
import type { DigitalSignatureProvider, SignatureInput, SignatureResult } from "./provider";

export class Sha256Provider implements DigitalSignatureProvider {
  async sign(input: SignatureInput): Promise<SignatureResult> {
    const hash = createHash("sha256")
      .update(input.content + input.doctor_id + input.timestamp)
      .digest("hex");

    return {
      hash,
      provider: "sha256",
      certificate_serial: null,
      timestamp_rfc3161: null,
    };
  }
}
