//

describe("join organizations", () => {
  beforeEach(() => {
    cy.mailslurp().then((mailslurp) =>
      mailslurp.inboxController.deleteAllInboxEmails({
        inboxId: "435f6a4d-df7d-4840-be7b-bc4851b64e91",
      }),
    );
  });

  it("join collectivité territoriale with official contact email", function () {
    cy.visit("/users/join-organization");
    cy.login("435f6a4d-df7d-4840-be7b-bc4851b64e91@mailslurp.com");

    cy.get('[name="siret"]').type("21340126800130");
    cy.get('[type="submit"]').click();

    // Check the choice of email

    cy.contains("Continuer avec cet email").click();

    cy.contains("Votre compte est créé");
  });

  it("join primary school with official contact email", function () {
    cy.visit("/users/join-organization");
    cy.login("435f6a4d-df7d-4840-be7b-bc4851b64e91@mailslurp.com");

    cy.get('[name="siret"]').type("21340126800049");
    cy.get('[type="submit"]').click();

    cy.contains("Votre compte est créé");
  });
});
