//

import { expect } from "chai";
import { test } from "mocha";
import { isAFreeDomain } from "./is-a-free-domain.js";

//

test("should return true for free domains", () => {
  expect(isAFreeDomain("gmail.com")).to.be.true;
  expect(isAFreeDomain("hotmail.com")).to.be.true;
  expect(isAFreeDomain("yahoo.com")).to.be.true;
  expect(isAFreeDomain("outlook.com")).to.be.true;
  expect(isAFreeDomain("aol.com")).to.be.true;
  expect(isAFreeDomain("yopmail.com")).to.be.true;
});

test("should return false for non-free domains", () => {
  expect(isAFreeDomain("beta.gouv.fr")).to.be.false;
});
