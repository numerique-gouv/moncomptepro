//

import { emptyDatabase, migrate, pg } from "#testing";
import { beforeAll, beforeEach, expect, test } from "vitest";
import { updateUserFactory } from "./update.js";

//

const updateUser = updateUserFactory({ pg: pg as any });

beforeAll(migrate);
beforeEach(emptyDatabase);

test("should update the user job", async () => {
  await pg.sql`
    INSERT INTO users
      (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
    VALUES
      (1, 'lion.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'Lion', 'El''Jonson', 'I', 'Primarque');
  `;

  const user = await updateUser(1, { job: "Chevalier de l'Ordre" });

  expect(user).toMatchInlineSnapshot();
});
