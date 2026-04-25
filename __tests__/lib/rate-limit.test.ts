import { describe, it, expect, vi, beforeEach } from "vitest";

const counters = new Map<string, number>();

vi.mock("@upstash/redis", () => ({
  Redis: class {
    constructor(_opts: unknown) {}
  },
}));

vi.mock("@upstash/ratelimit", () => {
  class Ratelimit {
    constructor(_opts: unknown) {}
    async limit(key: string) {
      const count = (counters.get(key) ?? 0) + 1;
      counters.set(key, count);
      // Mock: limit of 3 per window
      return { success: count <= 3 };
    }
    static slidingWindow(_limit: number, _window: string) {
      return {};
    }
  }
  return { Ratelimit };
});

let checkRateLimit: (key: string, limit: number, windowMs: number) => Promise<boolean>;

beforeEach(async () => {
  counters.clear();
  vi.resetModules();
  const mod = await import("@/lib/rate-limit");
  checkRateLimit = mod.checkRateLimit;
});

describe("checkRateLimit", () => {
  it("permite requests dentro del límite", async () => {
    const key = `test:${Date.now()}`;
    expect(await checkRateLimit(key, 3, 60_000)).toBe(true);
    expect(await checkRateLimit(key, 3, 60_000)).toBe(true);
    expect(await checkRateLimit(key, 3, 60_000)).toBe(true);
  });

  it("bloquea al superar el límite", async () => {
    const key = `test:${Date.now()}-block`;
    await checkRateLimit(key, 3, 60_000);
    await checkRateLimit(key, 3, 60_000);
    await checkRateLimit(key, 3, 60_000);
    expect(await checkRateLimit(key, 3, 60_000)).toBe(false);
  });

  it("keys distintas no interfieren entre sí", async () => {
    const a = `test:${Date.now()}-a`;
    const b = `test:${Date.now()}-b`;
    await checkRateLimit(a, 3, 60_000);
    await checkRateLimit(a, 3, 60_000);
    await checkRateLimit(a, 3, 60_000);
    await checkRateLimit(a, 3, 60_000);
    expect(await checkRateLimit(b, 3, 60_000)).toBe(true);
  });
});
