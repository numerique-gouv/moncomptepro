//

describe("sign-in from legacy client", () => {
  before(() => {
    cy.exec(
      `docker compose --project-directory ${__dirname} up --detach --build`,
    );
    cy.exec(`docker compose --project-directory ${__dirname} wait migrated-db`);
    // cy.exec(
    //   [
    //     "docker run",
    //     "--detach",
    //     "--env MCP_CLIENT_ID=legacy_client_id",
    //     "--env MCP_CLIENT_SECRET=legacy_client_secret",
    //     "--env MCP_PROVIDER=http://host.docker.internal:3000",
    //     "--env MCP_SCOPES='openid email profile phone organizations'",
    //     "--name moncomptepro-legacy-client",
    //     "--publish 4002:3000",
    //     "--rm",
    //     "ghcr.io/betagouv/moncomptepro-test-client:latest",
    //   ].join(" "),
    // )
    //   .its("stderr")
    //   .should("be.empty");
    // cy.seed(__filename.split("/").at(-1).replace(".cy.js", ""));
  });

  // after(() => {
  //   cy.exec(`docker compose --project-directory ${__dirname} stop`);
  // });

  it("should sign-in", function () {
    cy.visit(`http://moncomptepro-legacy-client.localhost/`);
    cy.get("button.moncomptepro-button").click();

    cy.get('[name="login"]').type("unused1@yopmail.com");
    cy.get('[type="submit"]').click();

    cy.get('[name="password"]').type("password123");
    cy.get('[action="/users/sign-in"]  [type="submit"]')
      .contains("S’identifier")
      .click();

    cy.contains("moncomptepro-legacy-client");
    cy.contains("unused1@yopmail.com");
    cy.contains("Commune de lamalou-les-bains");

    // then it should prompt for organization
    cy.visit(`http://moncomptepro-standard-client.localhost/`);
    cy.get("button.moncomptepro-button").click();
    cy.contains("Votre organisation de rattachement");
    cy.contains("Commune de lamalou-les-bains - Mairie").click();
    cy.contains("moncomptepro-standard-client");
    cy.contains("Commune de lamalou-les-bains - Mairie");
  });
});
