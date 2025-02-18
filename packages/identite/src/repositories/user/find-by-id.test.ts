//

import { emptyDatabase, migrate, pg } from "#testing";
import { beforeAll, beforeEach, expect, test } from "vitest";
import { findByIdFactory } from "./find-by-id.js";

//

const findById = findByIdFactory({ pg: pg as any });

beforeAll(migrate);
beforeEach(emptyDatabase);

test("should find a user by id", async () => {
  await pg.sql`
    INSERT INTO users
      (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
    VALUES
      (1, 'lion.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'lion', 'el''jonson', 'i', 'primarque'),
      (2, 'perturabo@ironwarriors.world', '4444-04-04', '4444-04-04', 'lion', 'el''jonson', 'iv', 'primarque')
    ;
  `;

  const user = await findById(1);

  expect(user?.email).toEqual("lion.eljonson@darkangels.world");
});

test("❎ fail to find the God-Emperor of Mankind", async () => {
  const user = await findById(42);

  expect(user).toBeUndefined();
});
