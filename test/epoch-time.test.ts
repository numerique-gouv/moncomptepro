import { assert } from "chai";
import FakeTimers, { InstalledClock } from "@sinonjs/fake-timers";
import epochTime from "../src/services/epoch-time";

describe("isExpired", () => {
  let clock: InstalledClock;

  beforeEach(() => {
    clock = FakeTimers.install({ now: new Date(2023, 11, 1) });
  });

  afterEach(() => {
    clock.uninstall();
  });

  it("should return current date in epoch format", () => {
    assert.strictEqual(epochTime(), 1701388800);
  });

  it("should return a date in epoch format", () => {
    const emittedDate = new Date(2023, 11, 1, 0, 1);

    assert.strictEqual(epochTime(emittedDate), 1701388860);
  });
});
