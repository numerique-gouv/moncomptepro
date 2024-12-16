//

import { PGlite } from "@electric-sql/pglite";
import { expect } from "chai";
import { before, describe, it } from "mocha";
import { runner } from "node-pg-migrate";
import { join } from "path";
import { findByEmailFactory } from "./find-by-email.js";

//

const pg = new PGlite();
const findByEmail = findByEmailFactory({ pg: pg as any });

before(async function migrate() {
  await runner({
    dbClient: pg as any,
    dir: join(import.meta.dirname, "../../../../migrations"),
    direction: "up",
    migrationsTable: "pg-migrate",
  });
});

describe("FindByEmail", () => {
  it("should find a user by email", async () => {
    await pg.sql`INSERT INTO users
    (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
  VALUES
    (1, 'lion.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'Lion', 'El''Jonson', 'I', 'Primarque'),
    (2, 'perturabo@ironwarriors.world', '4444-04-04', '4444-04-04', 'Lion', 'El''Jonson', 'IV', 'Primarque');
  `;

    const user = await findByEmail("lion.eljonson@darkangels.world");

    expect(user).to.deep.equal({
      created_at: new Date("4444-04-04T00:00:00.000Z"),
      current_challenge: null,
      email_verified_at: null,
      email_verified: false,
      email: "lion.eljonson@darkangels.world",
      encrypted_password: "",
      encrypted_totp_key: null,
      family_name: "El'Jonson",
      force_2fa: false,
      given_name: "Lion",
      id: 1,
      job: "Primarque",
      last_sign_in_at: null,
      magic_link_sent_at: null,
      magic_link_token: null,
      needs_inclusionconnect_onboarding_help: false,
      needs_inclusionconnect_welcome_page: false,
      phone_number: "I",
      reset_password_sent_at: null,
      reset_password_token: null,
      sign_in_count: 0,
      totp_key_verified_at: null,
      updated_at: new Date("4444-04-04T00:00:00.000Z"),
      verify_email_sent_at: null,
      verify_email_token: null,
    });
  });

  it("❎ fail to find the God-Emperor of Mankind", async () => {
    const user = await findByEmail("the God-Emperor of Mankind");

    expect(user).to.be.undefined;
  });
});
