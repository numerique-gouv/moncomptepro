//

import { emptyDatabase, migrate, pg } from "#testing";
import { expect } from "chai";
import { before, describe, it } from "mocha";
import { upsertFactory } from "./upsert.js";

//

const upset = upsertFactory({ pg: pg as any });

describe("upset", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  it("should create the Tau Empire organization", async () => {
    const organization = await upset({
      organizationInfo: {
        libelle: "Tau Empire",
        nomComplet: "Tau Empire",
      } as any,
      siret: "👽️",
    });
    expect(organization.created_at).to.deep.equal(organization.updated_at);
  });

  it("should update the Necron organization", async () => {
    await pg.sql`
      INSERT INTO organizations
        (siret, created_at, updated_at)
      VALUES
        ('⚰️', '1967-12-19', '1967-12-19');
    `;
    const organization = await upset({
      organizationInfo: {
        libelle: "Necron",
        nomComplet: "Necrontyr",
      } as any,
      siret: "⚰️",
    });
    expect(organization.created_at).to.not.deep.equal(organization.updated_at);
    expect(organization.cached_libelle).to.equal("Necron");
  });
});
