import { generateToken } from "@sunknudsen/totp";

describe("sign-in with TOTP on untrusted browser", () => {
  it("should sign-in with password and TOTP", function () {
    cy.visit(`http://localhost:4001`);
    cy.get("button.moncomptepro-button").click();
    cy.get('[name="password"]').type("password123");
    cy.get('[action="/users/sign-in"]  [type="submit"]')
      .contains("S’identifier")
      .click();

    cy.contains("Valider en deux étapes");

    const totp = generateToken("din5ncvbluqpx7xfzqcybmibmtjocnsf", Date.now());
    cy.get("[name=totpToken]").type(totp);
    cy.get(
      '[action="/users/2fa-sign-in-with-authenticator-app"] [type="submit"]',
    ).click();

    cy.contains('"amr": [\n    "pwd",\n    "totp",\n    "mfa"\n  ],');
  });
});
