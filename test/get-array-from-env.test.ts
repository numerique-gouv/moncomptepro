import { assert } from "chai";
import { getArrayFromEnv } from "../src/config/env"; // Replace with the actual path of your module

describe("getArrayFromEnv", () => {
  let oldEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Backup the actual environment
    oldEnv = process.env;
  });

  afterEach(() => {
    // Restore the actual environment after each test
    process.env = oldEnv;
  });

  it("should return empty array for undefined", () => {
    // Create a new environment mock
    process.env = { ...oldEnv };
    const envValue = "MY_VARIABLE";
    assert.deepEqual(getArrayFromEnv(envValue), []);
  });

  it("should return array", () => {
    // Create a new environment mock
    process.env = { ...oldEnv, MY_VARIABLE: "" };
    const envValue = "MY_VARIABLE";
    assert.deepEqual(getArrayFromEnv(envValue), []);
  });

  it("should return array", () => {
    // Create a new environment mock
    process.env = { ...oldEnv, MY_VARIABLE: "value1,value2," };
    const envValue = "MY_VARIABLE";
    assert.deepEqual(getArrayFromEnv(envValue), ["value1", "value2"]);
  });

  it("should return array", () => {
    // Create a new environment mock
    process.env = { ...oldEnv, MY_VARIABLE: "value1, value2 " };
    const envValue = "MY_VARIABLE";
    assert.deepEqual(getArrayFromEnv(envValue), ["value1", "value2"]);
  });
});
