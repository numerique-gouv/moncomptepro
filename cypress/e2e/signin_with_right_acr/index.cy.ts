//

describe("sign-in with a client requiring consistency-checked identity", () => {
  it("should sign-in an return the right acr value", function () {
    cy.visit("http://localhost:4003");
    cy.get("button#force-2fa").click();

    cy.login("ial2-aal1@yopmail.com");

    cy.contains('"acr": "urn:dinum:ac:classes:consistency-checked"');
  });
  it("should return an error with ial1", function () {
    cy.visit("http://localhost:4003");
    cy.get("button#force-2fa").click();

    cy.login("ial1-aal1@yopmail.com");

    cy.contains("access_denied (none of the requested ACRs could be obtained)");
  });

  // TODO add tests:
  // - log with a client requiring consistency-checked and consistency-checked-mfa
  //   - with a consistency checked user and MFA => see the right acr returned
  //   - with a self-asserted user and MFA => see an error
  // - log with a client not requiring any acr
  //   - with a self-asserted user => see acr self-asserted
  //   - with a consistency checked user => see acr consistency-checked
  // - log with acr_values=eidas1 and ENABLE_FIXED_ACR=True
  //   - with all type of acr => see the right acr
  // these tests required the mcp-test-client to be modifiable like fc-mock
});
