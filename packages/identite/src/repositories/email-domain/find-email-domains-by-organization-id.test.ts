//

import { emptyDatabase, migrate, pg } from "#testing";
import { expect } from "chai";
import { describe, it } from "mocha";
import { findEmailDomainsByOrganizationIdFactory } from "./find-email-domains-by-organization-id.js";

//

const findEmailDomainsByOrganizationId =
  findEmailDomainsByOrganizationIdFactory({ pg: pg as any });

describe(findEmailDomainsByOrganizationIdFactory.name, () => {
  beforeAll(migrate);
  beforeEach(emptyDatabase);

  it("should find email domains by organization id", async () => {
    await pg.sql`
      INSERT INTO organizations
        (id, siret, created_at, updated_at)
      VALUES
        (1, '66204244933106', '4444-04-04', '4444-04-04')
      ;
    `;

    await pg.sql`
      INSERT INTO email_domains
        (id, domain, organization_id, created_at, updated_at)
      VALUES
        (1, 'darkangels.world', 1, '4444-04-04', '4444-04-04')
      ;
    `;

    const emailDomains = await findEmailDomainsByOrganizationId(1);

    expect(emailDomains).to.deep.equal([
      {
        can_be_suggested: true,
        created_at: new Date("4444-04-04"),
        domain: "darkangels.world",
        id: 1,
        organization_id: 1,
        updated_at: new Date("4444-04-04"),
        verification_type: null,
        verified_at: null,
      },
    ]);
  });

  it("❎ fail to find the organization 42", async () => {
    const user = await findEmailDomainsByOrganizationId(42);

    expect(user).to.be.deep.equal([]);
  });
});
