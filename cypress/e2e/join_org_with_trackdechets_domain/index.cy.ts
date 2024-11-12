//

//

describe("join organizations", () => {
  before(() => {
    return cy.mailslurp().then((mailslurp) =>
      mailslurp.inboxController.deleteAllInboxEmails({
        inboxId: "0c5b976c-b6b0-406e-a7ed-08ddae8d2d81",
      }),
    );
  });

  it("join suggested organisation", function () {
    cy.visit("/");
    cy.login("0c5b976c-b6b0-406e-a7ed-08ddae8d2d81@mailslurp.com");

    // The user gets this suggestion because it as mailslurp.com as trackdechets domain
    cy.get(".fr-grid-row .fr-col-12:first-child .fr-tile__link").contains(
      "Bnp paribas",
    );

    // Click on the suggested organization
    cy.get(".fr-grid-row .fr-col-12:first-child .fr-tile__link").click();

    // Check redirection to welcome page
    cy.contains("Votre compte est créé !");

    cy.maildevGetMessageBySubject(
      "Votre compte ProConnect a bien été créé",
    ).then((email) => {
      cy.maildevVisitMessageById(email.id);
      cy.maildevDeleteMessageById(email.id);
      cy.contains("Votre compte ProConnect est créé !");
    });
  });
});
