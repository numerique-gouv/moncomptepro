//

describe("delete account", () => {
  it("should delete account", function () {
    cy.visit("/connection-and-account");

    cy.login("4cec922b-ecbe-4a46-8511-fc9478c1efd0@mailslurp.com");

    cy.contains("Suppression");

    cy.contains("Supprimer mon compte").click();

    cy.contains("Votre compte a bien été supprimé.");

    cy.maildevGetMessageBySubject("Suppression de compte").then((email) => {
      cy.maildevVisitMessageById(email.id);
      cy.contains(
        "Nous vous confirmons que votre demande de suppression de compte a bien été prise en compte.",
      );
      cy.maildevDeleteMessageById(email.id);
    });
  });
});
