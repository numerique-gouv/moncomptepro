//

describe("join organizations", () => {
  it("join big company with free email provider", function () {
    cy.visit(`/users/start-sign-in`);

    cy.login("unused1@yopmail.com");

    cy.visit(`/users/join-organization`);
    cy.get('[name="siret"]').type("54205118000066");
    cy.get('[type="submit"]').click();

    cy.contains(
      "Vous souhaitez rejoindre Totalenergies se avec l’adresse email unused1@yopmail.com.",
    );

    cy.get('[href="/users/start-sign-in"]')
      .contains("Corriger l’email")
      .click();

    cy.login("unused2@yopmail.com");

    cy.get('[name="siret"]').type("54205118000066");
    cy.get('[type="submit"]').click();

    cy.contains(
      "Vous souhaitez rejoindre Totalenergies se avec l’adresse email unused2@yopmail.com.",
    );

    cy.get('[type="submit"]').contains("Continuer avec cet email").click();

    cy.contains(
      "Notre équipe étudie votre demande de rattachement à l’organisation Totalenergies se avec l’adresse email unused2@yopmail.com.",
    );
  });
});
