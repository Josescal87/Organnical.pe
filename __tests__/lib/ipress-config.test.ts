import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSingle = vi.fn();
const mockEq = vi.fn().mockReturnThis();
const mockSelect = vi.fn().mockReturnThis();
const mockFrom = vi.fn().mockReturnThis();
const mockSchema = vi.fn().mockReturnValue({
  from: mockFrom,
  select: mockSelect,
  eq: mockEq,
  single: mockSingle,
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn().mockReturnValue({ schema: mockSchema }),
}));

// The module under test is not created yet — this will fail to import
// until lib/ipress-config.ts exists.

describe("getIpressMode", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 'disabled' when flag is 'disabled'", async () => {
    mockSingle.mockResolvedValue({ data: { value: "disabled" }, error: null });
    const { getIpressMode } = await import("@/lib/ipress-config");
    expect(await getIpressMode()).toBe("disabled");
  });

  it("returns 'enabled' when flag is 'enabled'", async () => {
    mockSingle.mockResolvedValue({ data: { value: "enabled" }, error: null });
    const { getIpressMode } = await import("@/lib/ipress-config");
    expect(await getIpressMode()).toBe("enabled");
  });

  it("defaults to 'disabled' when row is missing", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: "not found" } });
    const { getIpressMode } = await import("@/lib/ipress-config");
    expect(await getIpressMode()).toBe("disabled");
  });
});

describe("isIpressEnabled", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns false when mode is disabled", async () => {
    mockSingle.mockResolvedValue({ data: { value: "disabled" }, error: null });
    const { isIpressEnabled } = await import("@/lib/ipress-config");
    expect(await isIpressEnabled()).toBe(false);
  });

  it("returns true when mode is enabled", async () => {
    mockSingle.mockResolvedValue({ data: { value: "enabled" }, error: null });
    const { isIpressEnabled } = await import("@/lib/ipress-config");
    expect(await isIpressEnabled()).toBe(true);
  });
});
