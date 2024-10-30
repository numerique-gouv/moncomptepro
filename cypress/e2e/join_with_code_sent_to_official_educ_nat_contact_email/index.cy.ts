//

describe("join organizations", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("join collectivité territoriale with code send to official contact email", function () {
    cy.visit("/users/join-organization");
    cy.login("10efdabd-deb0-4d19-a521-6772ca27acf8@mailslurp.com");

    cy.get('[name="siret"]').type("19750663700010");
    cy.get('[type="submit"]').click();

    // Check that the website is waiting for the user to verify their email
    cy.contains(
      "nous avons envoyé un code secret à l’adresse email de votre établissement scolaire",
    );
    cy.get("#email-badge-lowercase").contains(
      "01714bdb-c5d7-48c9-93ab-73dc78c13609@mailslurp.com",
    );

    cy.maildevGetMessageBySubject(
      "[ProConnect] Authentifier un email sur ProConnect",
    )
      .then((email) => {
        cy.maildevVisitMessageById(email.id);
        cy.maildevDeleteMessageById(email.id);
        cy.contains(
          "Jean Nouveau (10efdabd-deb0-4d19-a521-6772ca27acf8@mailslurp.com) souhaite rejoindre votre organisation « Lycee general et technologique chaptal » sur ProConnect.",
        );
        return cy.get("em:nth-child(1)").invoke("text");
      })
      .then((code) => {
        cy.wrap(code).as("code");
      });

    cy.go("back");

    cy.get<string>("@code").then((code) => {
      cy.log(code);
      cy.get('[name="official_contact_email_verification_token"]').type(code);
      cy.get('[type="submit"]').click();
    });

    cy.contains("Votre compte est créé !");
  });
});
