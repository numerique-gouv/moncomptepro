//

import { emptyDatabase, migrate, pg } from "#testing";
import { beforeAll, beforeEach, expect, test } from "vitest";
import { createUserFactory } from "./create.js";

//

const createUser = createUserFactory({ pg: pg as any });

beforeAll(migrate);
beforeEach(emptyDatabase);

test("should create the god-emperor of mankind", async () => {
  const user = await createUser({ email: "god-emperor@mankind" });
  expect(user.email).toBe("god-emperor@mankind");
});
