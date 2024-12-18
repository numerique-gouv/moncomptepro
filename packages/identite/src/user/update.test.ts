//

import { PGlite } from "@electric-sql/pglite";
import { expect } from "chai";
import { noop } from "lodash-es";
import { before, describe, it } from "mocha";
import { runner } from "node-pg-migrate";
import { join } from "path";
import { updateUserFactory } from "./update.js";

//

const pg = new PGlite();
const updateUser = updateUserFactory({ pg: pg as any });

before(async function migrate() {
  await runner({
    dbClient: pg as any,
    dir: join(import.meta.dirname, "../../../../migrations"),
    direction: "up",
    log: noop,
    migrationsTable: "pg-migrate",
  });
});

describe("UpdateUser", () => {
  it("should update the user job", async () => {
    await pg.sql`INSERT INTO users
    (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
  VALUES
    (1, 'lion.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'Lion', 'El''Jonson', 'I', 'Primarque');
  `;
    const user = await updateUser(1, { job: "Chevalier de l'Ordre" });
    expect(user.job).to.equal("Chevalier de l'Ordre");
  });
});
