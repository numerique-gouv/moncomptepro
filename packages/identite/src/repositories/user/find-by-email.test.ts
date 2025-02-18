//

import { emptyDatabase, migrate, pg } from "#testing";
import { expect } from "chai";
import { before, describe, it } from "mocha";
import { findByEmailFactory } from "./find-by-email.js";

//

const findByEmail = findByEmailFactory({ pg: pg as any });

describe(findByEmailFactory.name, () => {
  before(migrate);
  beforeEach(emptyDatabase);

  it("should find a user by email", async () => {
    await pg.sql`
      INSERT INTO users
        (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
      VALUES
        (1, 'lion.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'lion', 'el''jonson', 'i', 'primarque'),
        (2, 'perturabo@ironwarriors.world', '4444-04-04', '4444-04-04', 'lion', 'el''jonson', 'iv', 'primarque')
      ;
    `;

    const user = await findByEmail("lion.eljonson@darkangels.world");

    expect(user?.email).to.equal("lion.eljonson@darkangels.world");
  });

  it("❎ fail to find the God-Emperor of Mankind", async () => {
    const user = await findByEmail("the God-Emperor of Mankind");

    expect(user).to.be.undefined;
  });
});
