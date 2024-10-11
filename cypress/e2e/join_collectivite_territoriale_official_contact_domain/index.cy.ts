//

describe("join organizations", () => {
  before(() => {
    cy.mailslurp().then((mailslurp) =>
      mailslurp.inboxController.deleteAllInboxEmails({
        inboxId: "435f6a4d-df7d-4840-be7b-bc4851b64e91",
      }),
    );
  });

  it("join collectivité territoriale with official contact domain", function () {
    cy.visit("/users/join-organization");
    cy.login("76450610-4dcc-4664-b9ab-1cea869b62b1@mailslurp.com");

    cy.get('[name="siret"]').type("21740056300011");
    cy.get('[type="submit"]').click();

    cy.contains("Votre compte est créé !");
  });
});
