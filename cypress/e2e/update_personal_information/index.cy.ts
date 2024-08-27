describe("Signup into new entreprise unipersonnelle", () => {
  before(() => {
    cy.mailslurp().then((mailslurp) =>
      mailslurp.inboxController.deleteAllInboxEmails({
        inboxId: "9023e9f4-4e54-4ba0-9558-3cb61e7608c6",
      }),
    );
  });

  it("Should send email when user updates personal information", function () {
    cy.login(
      "9023e9f4-4e54-4ba0-9558-3cb61e7608c6@mailslurp.com",
      "password123",
    );

    cy.visit("/personal-information");

    cy.contains("Vos informations personnelles");

    cy.get('input[name="given_name"]').clear().type("Mister Rebecco");

    cy.get('[type="submit"]').contains("Mettre à jour").click();

    cy.contains("Vos informations ont été mises à jour.");

    cy.mailslurp()
      // use inbox id and a timeout of 30 seconds
      .then((mailslurp) =>
        mailslurp.waitForLatestEmail(
          "9023e9f4-4e54-4ba0-9558-3cb61e7608c6",
          60000,
          true,
        ),
      )
      // check subject of deletion email
      .then((email) => {
        expect(email.subject).to.include(
          "Mise à jour de vos données personnelles",
        );
      });
  });

  it("should show an error where putting invalid names or job", () => {
    cy.login(
      "9023e9f4-4e54-4ba0-9558-3cb61e7608c6@mailslurp.com",
      "password123",
    );

    cy.visit("/personal-information");

    ["given_name", "family_name", "job"].forEach((inputName) => {
      cy.get(`input[name="${inputName}"]`).clear().type("​");

      cy.get('[type="submit"]').contains("Mettre à jour").click();

      cy.contains(
        "Erreur : le format des informations personnelles est invalide.",
      );
    });
  });
});
