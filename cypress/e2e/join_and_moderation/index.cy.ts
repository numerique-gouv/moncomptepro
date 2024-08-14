//

import { MatchOptionFieldEnum, MatchOptionShouldEnum } from "mailslurp-client";

//

describe("join and moderation", () => {
  beforeEach(() => {
    cy.login(
      "86983334-028f-48b5-881d-8b05d738bec5@mailslurp.net",
      "password123",
    );
  });

  it("will be moderated", function () {
    cy.visit(`/`);
    cy.get('[name="siret"]').type("66204244933106");
    cy.get('[type="submit"]').click();

    cy.contains("Rattachement en cours");
    cy.contains(
      "⏱️ Notre équipe étudie votre demande de rattachement à l’organisation Bnp paribas - Bnp pariba",
    );
    cy.contains(
      "avec l’adresse email 86983334-028f-48b5-881d-8b05d738bec5@mailslurp.net.",
    );

    cy.maildevGetLastMessage().then((email) => {
      expect(email.subject).to.include(
        `[MonComptePro] Demande pour rejoindre Bnp paribas - Bnp paribas`,
      );
      cy.maildevVisitMessageById(email.id);
      cy.contains(
        "⏱️ Notre équipe est en train de vous rattacher à l’organisation Bnp paribas - Bnp paribas.",
      );
      cy.maildevDeleteMessageById(email.id);
    });
  });
});
