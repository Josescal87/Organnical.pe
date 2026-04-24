import { describe, it, expect } from "vitest";
import { sanitizeError } from "@/lib/sanitize-error";

describe("sanitizeError", () => {
  it("extrae el mensaje de un Error", () => {
    expect(sanitizeError(new Error("fallo de red"))).toBe("fallo de red");
  });

  it("devuelve strings directamente", () => {
    expect(sanitizeError("error de validación")).toBe("error de validación");
  });

  it("no expone objetos con datos sensibles", () => {
    const obj = { patient_id: "uuid-123", email: "user@example.com", details: "PHI" };
    const result = sanitizeError(obj);
    expect(result).toBe("Unknown error");
    expect(result).not.toContain("uuid-123");
    expect(result).not.toContain("user@example.com");
  });

  it("maneja null y undefined sin explotar", () => {
    expect(sanitizeError(null)).toBe("Unknown error");
    expect(sanitizeError(undefined)).toBe("Unknown error");
  });
});
