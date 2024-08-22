import FakeTimers, { InstalledClock } from "@sinonjs/fake-timers";
import { assert } from "chai";
import epochTime from "../src/services/epoch-time";

describe("epochTime", () => {
  let clock: InstalledClock;

  beforeEach(() => {
    clock = FakeTimers.install({ now: new Date("2023-12-01T00:00:00.000Z") });
  });

  afterEach(() => {
    clock.uninstall();
  });

  it("should return current date in epoch format", () => {
    assert.strictEqual(epochTime(), 1701388800);
  });

  it("should return a date in epoch format", () => {
    const emittedDate = new Date("2023-12-01T00:01:00.000Z");

    assert.strictEqual(epochTime(emittedDate), 1701388860);
  });
});
