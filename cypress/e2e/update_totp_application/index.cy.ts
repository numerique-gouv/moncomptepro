import { generateToken } from "@sunknudsen/totp";

describe("update TOTP application", () => {
  before(() => {
    cy.mailslurp().then((mailslurp) =>
      mailslurp.inboxController.deleteAllInboxEmails({
        inboxId: "d2469f84-9547-4190-b989-014876fd54ae",
      }),
    );
  });
  it("should update TOTP application, and replace old app with new", function () {
    cy.visit(`/connection-and-account`);

    cy.mfaLogin("d2469f84-9547-4190-b989-014876fd54ae@mailslurp.com");

    cy.contains("Connexion et compte").click();

    cy.contains("Changer d’application d’authentification").click();

    cy.contains("Changer d’application d’authentification");

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

    cy.contains("L’application d’authentification a été modifiée.");
    cy.mailslurp()
      // use inbox id and a timeout of 30 seconds
      .then((mailslurp) =>
        mailslurp.waitForLatestEmail(
          "d2469f84-9547-4190-b989-014876fd54ae",
          60000,
          true,
        ),
      )
      // check subject of deletion email
      .then((email) => {
        expect(email.subject).to.include(
          "Changement d'application d’authentification",
        );
      });
  });
});
