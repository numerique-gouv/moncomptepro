//

//

describe("join and moderation", () => {
  it("will be moderated", function () {
    cy.visit("/");

    cy.login("lion.eljonson@darkangels.world");

    cy.get('[name="siret"]').type("66204244933106");
    cy.get('[type="submit"]').click();

    cy.contains("Demande en cours");
    cy.contains(
      "Nous vérifions votre lien à l’organisation, vous recevrez un email de confirmation dès que votre compte sera validé.",
    );
  });
});
