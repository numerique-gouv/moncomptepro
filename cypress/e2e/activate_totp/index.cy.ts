import { generateToken } from "@sunknudsen/totp";

describe("add 2fa authentication", () => {
  before(() => {
    cy.mailslurp().then((mailslurp) =>
      mailslurp.inboxController.deleteAllInboxEmails({
        inboxId: "64d9024b-d389-4b9d-948d-a504082c14fa",
      }),
    );
  });

  it("should add 2fa authentication on account user", function () {
    cy.visit("/connection-and-account");

    cy.login("64d9024b-d389-4b9d-948d-a504082c14fa@mailslurp.com");

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
