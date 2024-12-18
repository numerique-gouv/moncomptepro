//

import { PGlite } from "@electric-sql/pglite";
import { expect } from "chai";
import { noop } from "lodash-es";
import { before, describe, it } from "mocha";
import { runner } from "node-pg-migrate";
import { join } from "path";
import { upsertFactory } from "./upsert.js";

//

const pg = new PGlite();
const upset = upsertFactory({ pg: pg as any });

before(async function migrate() {
  await runner({
    dbClient: pg as any,
    dir: join(import.meta.dirname, "../../../../migrations"),
    direction: "up",
    migrationsTable: "pg-migrate",
    log: noop,
  });
});

describe("upset", () => {
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
    await pg.sql`insert into organizations
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
