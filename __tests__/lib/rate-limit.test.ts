import { describe, it, expect, beforeEach, vi } from "vitest";

// Reimport fresh module each test to reset module-level Map
let checkRateLimit: (key: string, limit: number, windowMs: number) => boolean;

beforeEach(async () => {
  vi.resetModules();
  const mod = await import("@/lib/rate-limit");
  checkRateLimit = mod.checkRateLimit;
});

describe("checkRateLimit", () => {
  it("permite requests dentro del límite", () => {
    const key = `test:${Date.now()}`;
    expect(checkRateLimit(key, 3, 60_000)).toBe(true);
    expect(checkRateLimit(key, 3, 60_000)).toBe(true);
    expect(checkRateLimit(key, 3, 60_000)).toBe(true);
  });

  it("bloquea al superar el límite", () => {
    const key = `test:${Date.now()}-block`;
    checkRateLimit(key, 2, 60_000);
    checkRateLimit(key, 2, 60_000);
    expect(checkRateLimit(key, 2, 60_000)).toBe(false);
  });

  it("reinicia el contador al vencer la ventana", () => {
    vi.useFakeTimers();
    const key = `test:${Date.now()}-reset`;
    checkRateLimit(key, 1, 1_000);
    expect(checkRateLimit(key, 1, 1_000)).toBe(false);

    vi.advanceTimersByTime(1_001);
    expect(checkRateLimit(key, 1, 1_000)).toBe(true);
    vi.useRealTimers();
  });

  it("keys distintas no interfieren entre sí", () => {
    const a = `test:${Date.now()}-a`;
    const b = `test:${Date.now()}-b`;
    checkRateLimit(a, 1, 60_000);
    expect(checkRateLimit(a, 1, 60_000)).toBe(false);
    expect(checkRateLimit(b, 1, 60_000)).toBe(true);
  });
});
