//

import { emptyDatabase, migrate, pg } from "#testing";
import { expect } from "chai";
import { before, describe, it } from "mocha";
import { createUserFactory } from "./create.js";

//

const createUser = createUserFactory({ pg: pg as any });

describe(createUserFactory.name, () => {
  before(migrate);
  beforeEach(emptyDatabase);

  it("should create the god-emperor of mankind", async () => {
    const user = await createUser({ email: "god-emperor@mankind" });
    expect(user.email).to.equal("god-emperor@mankind");
  });
});
