describe("Signup into new entreprise unipersonnelle", () => {
  it("Should send email when user updates personal information", function () {
    // Visit the signup page
    cy.visit(`/users/start-sign-in`);

    cy.get('[name="login"]').type(
      "716fc7c8-8828-48d5-b748-57dd4e78e55a@mailslurp.com",
    );
    cy.get('[type="submit"]').click();

    cy.get('[name="password"]').type("password123");
    cy.get('[action="/users/sign-in"]  [type="submit"]')
      .contains("S’identifier")
      .click();

    cy.contains("Informations personnelles").click();

    cy.contains("Vos informations personnelles");

    cy.get('input[name="given_name"]').clear().type("Mister Rebecco");

    cy.contains("Mettre à jour").click();

    cy.contains("Vos informations ont été mises à jour.");

    cy.maildevGetLastMessage().then((email) => {
      expect(email.subject).to.equal("Mise à jour de vos données personnelles");
      cy.maildevVisitMessageById(email.id);
      cy.contains(
        "Nous vous informons que vos données personnelles ont été mises à jour avec succès.",
      );
      cy.maildevDeleteMessageById(email.id);
    });
  });
});
