import { afterEach, describe, expect, it, vi } from "vitest";
import epochTime from "../src/services/epoch-time";

describe("epochTime", () => {
  afterEach(vi.useRealTimers);

  it("should return current date in epoch format", () => {
    vi.setSystemTime(new Date("2023-12-01T00:00:00.000Z"));
    expect(epochTime()).toBe(1701388800);
  });

  it("should return a date in epoch format", () => {
    const emittedDate = new Date("2023-12-01T00:01:00.000Z");

    expect(epochTime(emittedDate)).toBe(1701388860);
  });
});
