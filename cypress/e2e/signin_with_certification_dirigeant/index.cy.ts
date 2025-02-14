describe("sign-in with a client requiring certification dirigeant", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4000");
    cy.setRequestedAcrs([
      "https://proconnect.gouv.fr/assurance/certification-dirigeant",
    ]);
  });

  it("should sign-in an return the right acr value", function () {
    cy.get("button#custom-connection").click({ force: true });
    cy.login("certification-dirigeant@yopmail.com");

    cy.contains("Authentifier votre statut");
    cy.contains("S’identifier avec").click();

    cy.origin("https://fcp.integ01.dev-franceconnect.fr", () => {
      cy.contains("FIP1-LOW - eIDAS LOW").click();
    });
    cy.origin("https://fip1-low.integ01.fcp.fournisseur-d-identite.fr", () => {
      cy.contains("Mot de passe").click();
      cy.focused().type("123");
      cy.contains("Valider").click();
    });
    cy.origin("https://fcp.integ01.dev-franceconnect.fr", () => {
      cy.contains("Continuer sur FSPublic").click();
    });

    cy.contains("Vous allez vous connecter en tant que ");
    cy.contains("Angela Claire Louise DUBOIS");

    cy.contains(
      "J'accepte que FranceConnect transmette mes données au service pour me connecter",
    ).click();
    cy.contains("Continuer").click();

    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/certification-dirigeant"',
    );
  });
});
