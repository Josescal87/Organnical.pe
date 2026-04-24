import { describe, it, expect } from "vitest";
import { SPECIALTY_LABELS } from "@/lib/specialty-labels";

describe("SPECIALTY_LABELS", () => {
  it("contiene las 4 especialidades definidas", () => {
    expect(SPECIALTY_LABELS).toHaveProperty("sleep");
    expect(SPECIALTY_LABELS).toHaveProperty("pain");
    expect(SPECIALTY_LABELS).toHaveProperty("anxiety");
    expect(SPECIALTY_LABELS).toHaveProperty("womens_health");
  });

  it("devuelve strings no vacíos para cada especialidad", () => {
    for (const label of Object.values(SPECIALTY_LABELS)) {
      expect(typeof label).toBe("string");
      expect(label.length).toBeGreaterThan(0);
    }
  });

  it("no tiene duplicados en los valores", () => {
    const values = Object.values(SPECIALTY_LABELS);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });
});
