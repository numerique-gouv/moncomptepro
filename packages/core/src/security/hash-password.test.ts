//

import bcrypt from "bcryptjs";
import { assert } from "chai";
import { hashPassword } from "./hash-password.js";

//

describe("hashPassword", () => {
  it("should hash a password", async () => {
    const hashedPassword = await hashPassword("🔑");
    const isSamePassword = await bcrypt.compare("🔑", hashedPassword);
    assert.isTrue(isSamePassword);
  });
});
