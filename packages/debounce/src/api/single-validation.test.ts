//

import { expect } from "chai";
import { before, describe } from "mocha";
import { singleValidationFactory } from "./single-validation.js";

//

const { DEBOUNCE_API_KEY } = process.env;
const singleValidation = singleValidationFactory(DEBOUNCE_API_KEY ?? "");

//

describe("singleValidationFactory", () => {
  before(function () {
    if (!DEBOUNCE_API_KEY) this.skip();
  });

  it("should return a valid response", async function () {
    const response = await singleValidation("test@test.com");
    expect(response).includes({
      email: "test@test.com",
      code: "3",
      role: "true",
      free_email: "true",
      result: "Invalid",
      reason: "Disposable, Role",
      send_transactional: "0",
      did_you_mean: "test@toke.com",
    });
  });
});
