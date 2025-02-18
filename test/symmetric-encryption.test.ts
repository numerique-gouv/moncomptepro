import { describe, expect, it } from "vitest";
import {
  decryptSymmetric,
  encryptSymmetric,
} from "../src/services/symmetric-encryption"; // Replace with the actual path of your module

const key = "aTrueRandom32BytesLongBase64EncodedStringAA=";

describe("Symmetric encryption with aes-128-ccm", () => {
  it("should encrypt and decrypt string", () => {
    const plain = "Bonjour monde !";
    const encoded = encryptSymmetric(key, plain);
    expect(decryptSymmetric(key, encoded)).toEqual(plain);
  });

  it("should throw when encrypted string is null", () => {
    expect(() => decryptSymmetric(key, null)).toThrow("Invalid encrypted text");
  });

  it("should throw when encrypted string is invalid", () => {
    expect(() => decryptSymmetric(key, "null")).toThrow(
      "Invalid encrypted text",
    );
  });
});
