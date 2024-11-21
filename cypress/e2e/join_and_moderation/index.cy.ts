//

//

describe("join and moderation", () => {
  it("will be moderated", function () {
    cy.visit("/");

    cy.login("lion.eljonson@darkangels.world");

    cy.get('[name="siret"]').type("66204244933106");
    cy.get('[type="submit"]').click();

    cy.contains("Rattachement en cours");
    cy.contains(
      "⏱️ Notre équipe étudie votre demande de rattachement à l’organisation Bnp paribas - Bnp pariba",
    );
    cy.contains("avec l’adresse email lion.eljonson@darkangels.world.");
  });
});
