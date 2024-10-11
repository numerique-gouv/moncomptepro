//

describe("sign-in from proconnect federation client", () => {
  it("should sign-in", () => {
    cy.visit("http://localhost:4001");
    cy.get("button.proconnect-button").click();

    cy.get('[name="password"]').type("password123");
    cy.get('[action="/users/sign-in"]  [type="submit"]')
      .contains("S’identifier")
      .click();

    cy.contains("moncomptepro-proconnect-federation-client");
    cy.contains("unused1@yopmail.com");
    cy.contains("21340126800130");
  });

  it("should not prompt for password if a session is already opened", () => {
    cy.visit("/");
    cy.login("unused1@yopmail.com");

    cy.visit("http://localhost:4001");
    cy.get("button.proconnect-button").click();

    cy.contains("moncomptepro-proconnect-federation-client");
    cy.contains("unused1@yopmail.com");
  });

  it("login_hint should take precedence over existing session", () => {
    cy.visit("/");
    cy.login("unused2@yopmail.com");

    cy.visit("http://localhost:4001");
    cy.get("button.proconnect-button").click();

    cy.get('[name="password"]').type("password123");
    cy.get('[action="/users/sign-in"]  [type="submit"]')
      .contains("S’identifier")
      .click();

    cy.contains("moncomptepro-proconnect-federation-client");
    cy.contains("unused1@yopmail.com");
  });
});
