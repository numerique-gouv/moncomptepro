//

import { UserVerificationTypeSchema } from "#src/types";
import { PGlite } from "@electric-sql/pglite";
import { expect } from "chai";
import { noop } from "lodash-es";
import { before, describe, it } from "mocha";
import { runner } from "node-pg-migrate";
import { join } from "path";
import { getUserVerificationLinkFactory } from "./get-user-verification-link.js";

//

const pg = new PGlite();
const getUserVerificationLink = getUserVerificationLinkFactory({
  pg: pg as any,
});

before(async function migrate() {
  await runner({
    dbClient: pg as any,
    dir: join(import.meta.dirname, "../../../../migrations"),
    direction: "up",
    migrationsTable: "pg-migrate",
    log: noop,
  });
});
afterEach(() => pg.sql`delete from users;`);

describe("getUserVerificationLink", () => {
  it.only("should get the link between a user verification data", async () => {
    await pg.sql`
      INSERT INTO users
        (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
      VALUES
        (1, 'lion.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'lion', 'el''jonson', 'i', 'primarque'),
        (2, 'perturabo@ironwarriors.world', '4444-04-04', '4444-04-04', 'lion', 'el''jonson', 'iv', 'primarque')
      ;
    `;
    await pg.sql`
      INSERT INTO users_verification
        (user_id, verification_type)
      VALUES
        (1, 'franceconnect')
      ;
    `;

    const user = await getUserVerificationLink(1);

    expect(user?.verified_at).to.be.null;
    expect(user?.verification_type).to.equal(
      UserVerificationTypeSchema.Enum.franceconnect,
    );
  });

  it("❎ fail to get an unknown user", async () => {
    const user = await getUserVerificationLink(42);

    expect(user).to.be.undefined;
  });
});
