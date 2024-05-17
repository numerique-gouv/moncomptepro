//

describe("set info after account provisioning", () => {
  before(() => {
    cy.mailslurp().then((mailslurp) =>
      mailslurp.inboxController.deleteAllInboxEmails({
        inboxId: "ea2f1539-9675-4384-ab28-4dcecd0bd411",
      }),
    );
  });

  it("should show InclusionConnect welcome page on first visit", function () {
    // Visit the signup page
    cy.visit(`/users/start-sign-in`);

    // Sign in with the wrong password
    cy.get('[name="login"]').type(
      "ea2f1539-9675-4384-ab28-4dcecd0bd411@mailslurp.com",
    );
    cy.get('[type="submit"]').click();

    cy.contains("C’est votre première connexion avec ProConnect");

    cy.get('[type="submit"]').contains("Continuer").click();

    cy.contains(
      "Pour des raisons de sécurité, nous vous invitons à définir un nouveau mot de passe",
    );
  });

  it("it should not show InclusionConnect welcome page on second visit", function () {
    // Visit the signup page
    cy.visit(`/users/start-sign-in`);

    // Sign in with the wrong password
    cy.get('[name="login"]').type(
      "ea2f1539-9675-4384-ab28-4dcecd0bd411@mailslurp.com",
    );
    cy.get('[type="submit"]').click();

    cy.contains(
      "Pour des raisons de sécurité, nous vous invitons à définir un nouveau mot de passe",
    );
  });
});
