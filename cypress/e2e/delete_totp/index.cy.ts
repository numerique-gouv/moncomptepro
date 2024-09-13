describe("delete TOTP connexion", () => {
  before(() => {
    cy.mailslurp().then((mailslurp) =>
      mailslurp.inboxController.deleteAllInboxEmails({
        inboxId: "eab4ab97-875d-4ec7-bdcc-04323948ee63",
      }),
    );
    cy.mailslurp().then((mailslurp) =>
      mailslurp.inboxController.deleteAllInboxEmails({
        inboxId: "c9fabb94-9274-4ece-a3d0-54b1987c8588",
      }),
    );
  });

  it("should delete TOTP application", function () {
    cy.visit(`/connection-and-account`);

    cy.mfaLogin("eab4ab97-875d-4ec7-bdcc-04323948ee63@mailslurp.com");

    cy.contains("Application FreeOTP Authenticator");

    cy.contains("Supprimer l’application d’authentification").click();

    cy.contains("L’application d’authentification a bien été supprimée.");

    cy.mailslurp()
      // use inbox id and a timeout of 30 seconds
      .then((mailslurp) =>
        mailslurp.waitForLatestEmail(
          "eab4ab97-875d-4ec7-bdcc-04323948ee63",
          60000,
          true,
        ),
      )
      // check subject of deletion email
      .then((email) => {
        expect(email.subject).to.include(
          "Suppression d'une application d'authentification à double facteur",
        );
      });
  });

  it("should not be ask to sign with TOTP", function () {
    cy.visit(`http://localhost:4000`);
    cy.get("button.moncomptepro-button").click();
    cy.login("eab4ab97-875d-4ec7-bdcc-04323948ee63@mailslurp.com");

    cy.contains('"amr": [\n    "pwd"\n  ],');
  });

  it("should disable TOTP", function () {
    cy.visit(`/connection-and-account`);

    cy.mfaLogin("c9fabb94-9274-4ece-a3d0-54b1987c8588@mailslurp.com");

    cy.contains("Validation en deux étapes");

    cy.contains("Désactiver la validation en deux étapes").click();

    cy.mailslurp()
      // use inbox id and a timeout of 30 seconds
      .then((mailslurp) =>
        mailslurp.waitForLatestEmail(
          "c9fabb94-9274-4ece-a3d0-54b1987c8588",
          60000,
          true,
        ),
      )
      // check subject of deletion email
      .then((email) => {
        expect(email.subject).to.include(
          "Désactivation de la validation en deux étapes",
        );
      });
  });

  it("should not be ask to sign with TOTP", function () {
    cy.visit(`http://localhost:4000`);
    cy.get("button.moncomptepro-button").click();
    cy.login("c9fabb94-9274-4ece-a3d0-54b1987c8588@mailslurp.com");

    cy.contains('"amr": [\n    "pwd"\n  ],');
  });
});
