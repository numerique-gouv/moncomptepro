import { generateToken } from "@sunknudsen/totp";

before(() => {
  cy.seed();
});

describe("add 2fa authentication", () => {
  before(() => {
    cy.mailslurp().then((mailslurp) =>
      mailslurp.inboxController.deleteAllInboxEmails({
        inboxId: "64d9024b-d389-4b9d-948d-a504082c14fa",
      }),
    );
  });

  it("should add 2fa authentication on account user", function () {
    cy.visit(`/users/start-sign-in`);

    cy.get('[name="login"]').type(
      "64d9024b-d389-4b9d-948d-a504082c14fa@mailslurp.com",
    );
    cy.get('[type="submit"]').click();

    cy.get('[name="password"]').type("password123");
    cy.get('[action="/users/sign-in"]  [type="submit"]')
      .contains("S’identifier")
      .click();

    cy.contains("Connexion et compte").click();

    cy.contains("Application FreeOTP Authenticator");

    cy.contains("Configurer une application d’authentification").click();

    cy.contains("Configurer une application d’authentification");

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
});
