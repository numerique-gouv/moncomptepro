//

describe("sign-in from legacy client", () => {
  it("should sign-in", function () {
    cy.visit("http://localhost:4002");
    cy.get("button.moncomptepro-button").click();

    cy.login("unused1@yopmail.com");

    cy.contains("moncomptepro-legacy-client");
    cy.contains("unused1@yopmail.com");
    cy.contains("Commune de lamalou-les-bains");

    // then it should prompt for organization
    cy.visit("http://localhost:4000");
    cy.get("button.moncomptepro-button").click();
    cy.contains("Votre organisation de rattachement");
    cy.get(".fr-grid-row .fr-col-12:first-child .fr-tile__link").click();
    cy.contains("moncomptepro-standard-client");
    cy.contains("Commune de lamalou-les-bains - Mairie");
  });
});
