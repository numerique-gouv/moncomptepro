import { expect, test } from "vitest";
import { normalizeOfficialContactEmailVerificationToken } from "../src/services/normalize-official-contact-email-verification-token";

test.each([
  "crème brûlée façon grand-mère",
  "Crème Brûlée fAçon Grand-Mère",
  "  crème  brûlée     façon  grand-mère  ",
])("should return normalized token : %s", (rawToken) => {
  expect(normalizeOfficialContactEmailVerificationToken(rawToken)).toBe(
    "creme-brulee-facon-grand-mere",
  );
});
