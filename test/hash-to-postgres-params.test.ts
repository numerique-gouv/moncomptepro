import { describe, expect, it } from "vitest";
import { hashToPostgresParams } from "../src/services/hash-to-postgres-params";

describe("hashToPostgresParams", () => {
  it("should return update params for user", () => {
    const hash = { email: "email@xy.z", encrypted_password: "hash" };
    expect(hashToPostgresParams<typeof hash>(hash)).toEqual({
      paramsString: "(email, encrypted_password)",
      valuesString: "($1, $2)",
      values: ["email@xy.z", "hash"],
    });
  });
});
