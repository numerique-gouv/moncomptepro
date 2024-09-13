describe("sign-in with TOTP on untrusted browser", () => {
  it("should sign-in with password and TOTP", function () {
    cy.visit(`http://localhost:4000`);
    cy.get("button.moncomptepro-button").click();

    cy.mfaLogin("unused1@yopmail.com");

    cy.contains('"amr": [\n    "pwd",\n    "totp",\n    "mfa"\n  ],');
  });

  it("should sign-in with password and no TOTP", function () {
    cy.visit(`http://localhost:4000`);
    cy.get("button.moncomptepro-button").click();

    cy.login("unused2@yopmail.com");

    cy.contains("Vérifier votre email");
  });

  it("should sign-in with password and TOTP when forced by SP", function () {
    cy.visit(`http://localhost:4000`);
    cy.get("button#force-2fa").click();

    cy.mfaLogin("unused2@yopmail.com");

    cy.contains('"amr": [\n    "pwd",\n    "totp",\n    "mfa"\n  ],');
  });

  it("should trigger totp rate limiting", function () {
    cy.visit(`/users/start-sign-in`);

    cy.login("unused1@yopmail.com");

    for (let i = 0; i < 4; i++) {
      cy.get("[name=totpToken]").type("123456");
      cy.get(
        '[action="/users/2fa-sign-in-with-authenticator-app"] [type="submit"]',
      ).click();
      cy.contains("le code que vous avez utilisé est invalide.");
    }

    cy.get("[name=totpToken]").type("123456");
    cy.get(
      '[action="/users/2fa-sign-in-with-authenticator-app"] [type="submit"]',
    ).click();
    cy.contains("Too Many Requests");
  });
});
