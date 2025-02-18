//

import { emptyDatabase, migrate, pg } from "#testing";
import { expect } from "chai";
import { before, describe, it } from "mocha";
import { addDomainFactory } from "./add-domain.js";

//

const addDomain = addDomainFactory({ pg: pg as any });

describe(addDomainFactory.name, () => {
  before(migrate);
  beforeEach(emptyDatabase);

  it("should add domain", async () => {
    await pg.sql`
      INSERT INTO organizations
        (id, siret, created_at, updated_at)
      VALUES
        (1, '66204244933106', '4444-04-04', '4444-04-04')
      ;
    `;

    const emailDomain = await addDomain({
      domain: "darkangels.world",
      organization_id: 1,
      verification_type: "verified",
    });

    expect(emailDomain.domain).to.equal("darkangels.world");
    expect(emailDomain.verification_type).to.equal("verified");
    expect(emailDomain.created_at).to.deep.equal(emailDomain.updated_at);
  });
});
