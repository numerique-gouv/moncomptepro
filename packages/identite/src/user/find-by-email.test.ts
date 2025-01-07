//

import { PGlite } from "@electric-sql/pglite";
import { expect } from "chai";
import { noop } from "lodash-es";
import { before, describe, it } from "mocha";
import { runner } from "node-pg-migrate";
import { join } from "path";
import { findByEmailFactory } from "./find-by-email.js";

//

const pg = new PGlite();
const findByEmail = findByEmailFactory({ pg: pg as any });

before(async function migrate() {
  await runner({
    dbClient: pg as any,
    dir: join(import.meta.dirname, "../../../../migrations"),
    direction: "up",
    migrationsTable: "pg-migrate",
    log: noop,
  });
});

describe("FindByEmail", () => {
  it("should find a user by email", async () => {
    await pg.sql`insert into users
    (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
  values
    (1, 'lion.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'lion', 'el''jonson', 'i', 'primarque'),
    (2, 'perturabo@ironwarriors.world', '4444-04-04', '4444-04-04', 'lion', 'el''jonson', 'iv', 'primarque');
  `;

    const user = await findByEmail("lion.eljonson@darkangels.world");

    expect(user?.email).to.equal("lion.eljonson@darkangels.world");
  });

  it("❎ fail to find the God-Emperor of Mankind", async () => {
    const user = await findByEmail("the God-Emperor of Mankind");

    expect(user).to.be.undefined;
  });
});
