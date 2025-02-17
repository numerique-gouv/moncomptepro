import {
  type AddDomainHandler,
  type FindEmailDomainsByOrganizationIdHandler,
} from "#src/repositories/email-domain";
import type {
  FindByIdHandler,
  GetUsersByOrganizationHandler,
} from "#src/repositories/organization";
import type { UpdateUserOrganizationLinkHandler } from "#src/repositories/user";
import type {
  BaseUserOrganizationLink,
  EmailDomain,
  Organization,
  User,
  UserOrganizationLink,
} from "#src/types";
import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { mock } from "node:test";
import { markDomainAsVerifiedFactory } from "./mark-domain-as-verified.js";
//

chai.use(chaiAsPromised);
const assert = chai.assert;

describe(markDomainAsVerifiedFactory.name, () => {
  it("should update organization members", async () => {
    const addDomain = mock.fn<AddDomainHandler>(() =>
      Promise.resolve({} as any),
    );

    const updateUserOrganizationLink =
      mock.fn<UpdateUserOrganizationLinkHandler>(() =>
        Promise.resolve({} as any),
      );
    const markDomainAsVerified = markDomainAsVerifiedFactory({
      addDomain,
      findEmailDomainsByOrganizationId:
        mock.fn<FindEmailDomainsByOrganizationIdHandler>(),
      findOrganizationById: mock.fn<FindByIdHandler>(() =>
        Promise.resolve({ id: 42 } as Organization),
      ),
      getUsers: mock.fn<GetUsersByOrganizationHandler>(() =>
        Promise.resolve([
          {
            id: 42,
            email: "lion.eljonson@darkangels.world",
            verification_type: null,
          } as User & BaseUserOrganizationLink,
        ]),
      ),
      updateUserOrganizationLink,
    });

    await markDomainAsVerified({
      domain: "darkangels.world",
      domain_verification_type: "verified",
      organization_id: 42,
    });

    assert.deepEqual(updateUserOrganizationLink.mock.callCount(), 1);
    {
      const [call] = updateUserOrganizationLink.mock.calls;
      assert.deepEqual(call.arguments, [
        42,
        42,
        { verification_type: "domain" },
      ]);
    }

    assert.deepEqual(addDomain.mock.callCount(), 1);
    {
      const [call] = addDomain.mock.calls;
      assert.deepEqual(call.arguments, [
        {
          domain: "darkangels.world",
          organization_id: 42,
          verification_type: "verified",
        },
      ]);
    }
  });

  it("should add domain if organization if missing", async () => {
    const logs = [] as unknown[];
    const updateUserOrganizationLink: UpdateUserOrganizationLinkHandler = (
      ...args
    ) => {
      logs.push(args);
      return Promise.resolve({} as UserOrganizationLink);
    };
    const markDomainAsVerified = markDomainAsVerifiedFactory({
      addDomain: () => Promise.resolve({} as EmailDomain),
      findEmailDomainsByOrganizationId: () => Promise.resolve([]),
      findOrganizationById: () => Promise.resolve({ id: 42 } as Organization),
      getUsers: () =>
        Promise.resolve([
          {
            id: 42,
            email: "lion.eljonson@darkangels.world",
            verification_type: null,
          } as User & BaseUserOrganizationLink,
        ]),
      updateUserOrganizationLink,
    });

    await markDomainAsVerified({
      domain: "darkangels.world",
      domain_verification_type: "verified",
      organization_id: 42,
    });

    assert.deepEqual(logs, [[42, 42, { verification_type: "domain" }]]);
  });
});
