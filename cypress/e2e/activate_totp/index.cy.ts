import { generateToken } from "@sunknudsen/totp";

describe("add 2fa authentication", () => {
  before(() => {
    cy.mailslurp().then((mailslurp) =>
      mailslurp.inboxController.deleteAllInboxEmails({
        inboxId: "64d9024b-d389-4b9d-948d-a504082c14fa",
      }),
    );
    cy.mailslurp().then((mailslurp) =>
      mailslurp.inboxController.deleteAllInboxEmails({
        inboxId: "f86d5310-fe21-4521-ae84-7f51534a0483",
      }),
    );
  });

  it("should add 2fa authentication on account user", function () {
    cy.visit("/connection-and-account");

    cy.login("64d9024b-d389-4b9d-948d-a504082c14fa@mailslurp.com");

    cy.contains("Configurer un code à usage unique");

    cy.get('[href="/authenticator-app-configuration"]')
      .contains("Configurer un code à usage unique")
      .click();

    // Extract the code from the front to generate the TOTP key
    cy.get("#humanReadableTotpKey")
      .invoke("text")
      .then((text) => {
        const humanReadableTotpKey = text.trim().replace(/\s+/g, "");
        const totp = generateToken(humanReadableTotpKey, Date.now());
        cy.get("[name=totpToken]").type(totp);
        cy.get(
          '[action="/authenticator-app-configuration"] [type="submit"]',
        ).click();
      });

    cy.contains("L’application d’authentification a été configurée.");

    cy.mailslurp()
      // use inbox id and a timeout of 30 seconds
      .then((mailslurp) =>
        mailslurp.waitForLatestEmail(
          "64d9024b-d389-4b9d-948d-a504082c14fa",
          60000,
          true,
        ),
      )
      // check subject of deletion email
      .then((email) => {
        expect(email.subject).to.include("Validation en deux étapes activée");
      });
  });

  it("should be forced by SP to configure TOTP on sign-in", function () {
    cy.visit("http://localhost:4000");
    cy.get("button#force-2fa").click();

    cy.login("f86d5310-fe21-4521-ae84-7f51534a0483@mailslurp.com");

    cy.contains("Configurer la connexion à deux facteurs (2FA)");
  });
});
