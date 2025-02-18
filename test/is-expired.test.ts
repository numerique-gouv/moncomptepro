import { beforeEach, describe, expect, it, vi } from "vitest";
import { isExpired } from "../src/services/is-expired";

describe("isExpired", () => {
  beforeEach(() => {
    vi.setSystemTime(new Date(2022, 11, 20));
  });

  const expirationDurationInMinutes = 24 * 60;

  it("should return true when Date is undefined", () => {
    expect(isExpired(null, expirationDurationInMinutes)).toBeTruthy();
  });

  it("should return false when Date is about to expire", () => {
    const emittedDate = new Date(2022, 11, 19, 0, 1);

    expect(isExpired(emittedDate, expirationDurationInMinutes)).toBeFalsy();
  });

  it("should return true when Date is expired", () => {
    const emittedDate = new Date(2022, 11, 18, 23, 59);

    expect(isExpired(emittedDate, expirationDurationInMinutes)).toBeTruthy();
  });
});
