import { describe, expect, it } from "vitest";
import { jsonParseWithDate } from "../src/services/json-parse-with-date";

describe("jsonParseWithDate", () => {
  it("should parse Date from json iso string", () => {
    const string = '{"a":"2023-12-01T00:00:00.000Z"}';

    expect(jsonParseWithDate(string)).toEqual({
      a: new Date("2023-12-01"),
    });
  });

  it("should not infer on other types", () => {
    const string = '{"a":"a", "b": 2, "c": null}';

    expect(jsonParseWithDate(string)).toEqual({
      a: "a",
      b: 2,
      c: null,
    });
  });
});
