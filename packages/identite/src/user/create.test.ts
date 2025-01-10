//

import { PGlite } from "@electric-sql/pglite";
import { expect } from "chai";
import { noop } from "lodash-es";
import { before, describe, it } from "mocha";
import { runner } from "node-pg-migrate";
import { join } from "path";
import { createUserFactory } from "./create.js";

//

const pg = new PGlite();
const createUser = createUserFactory({ pg: pg as any });

before(async function migrate() {
  await runner({
    dbClient: pg as any,
    dir: join(import.meta.dirname, "../../../../migrations"),
    direction: "up",
    log: noop,
    migrationsTable: "pg-migrate",
  });
});

describe("CreateUser", () => {
  it("should create the god-emperor of mankind", async () => {
    const user = await createUser({ email: "god-emperor@mankind" });
    expect(user.email).to.equal("god-emperor@mankind");
  });
});
