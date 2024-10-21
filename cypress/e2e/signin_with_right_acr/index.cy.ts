describe("sign-in with a client not requiring any acr", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4000");
    cy.setRequestedAcrs();
  });

  it("should sign-in an return the right acr value", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial1-aal1@yopmail.com");

    cy.contains('"acr": "https://proconnect.gouv.fr/assurance/self-asserted"');
  });

  it("should sign-in an return the right acr value", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial2-aal1@yopmail.com");

    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/consistency-checked"',
    );
  });

  it("should sign-in an return the right acr value", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial1-aal2@yopmail.com");

    cy.contains('"acr": "https://proconnect.gouv.fr/assurance/self-asserted"');
  });

  it("should sign-in an return the right acr value", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial2-aal2@yopmail.com");

    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/consistency-checked"',
    );
  });
});

describe("sign-in with a client requiring consistency-checked identity", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4000");
    cy.setRequestedAcrs([
      "https://proconnect.gouv.fr/assurance/consistency-checked",
      "https://proconnect.gouv.fr/assurance/consistency-checked-2fa",
    ]);
  });

  it("should sign-in an return the right acr value", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial2-aal1@yopmail.com");

    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/consistency-checked"',
    );
  });

  it("should return an error with ial1", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial1-aal1@yopmail.com");

    cy.contains("access_denied (none of the requested ACRs could be obtained)");
  });
});

describe("sign-in with a client requiring 2fa identity", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4000");
    cy.setRequestedAcrs([
      "https://proconnect.gouv.fr/assurance/self-asserted-2fa",
      "https://proconnect.gouv.fr/assurance/consistency-checked-2fa",
    ]);
  });

  it("should sign-in an return the right acr value", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.mfaLogin("ial2-aal2@yopmail.com");

    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/consistency-checked-2fa"',
    );
  });

  it("should return an error with ial1", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial2-aal1@yopmail.com");

    cy.contains("Attention : le site que vous voulez utiliser requiert la 2FA");
  });
});
