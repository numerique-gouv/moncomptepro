import { describe, expect, it } from "vitest";
import { mustReturnOneOrganizationInPayload } from "../src/services/must-return-one-organization-in-payload";

describe("mustReturnOneOrganizationInPayload", () => {
  it("should return true if organization is amongst the scopes", () => {
    expect(
      mustReturnOneOrganizationInPayload("openid organization"),
    ).toBeTruthy();
  });

  it("should return true even if organizationS id amongst the scopes", () => {
    expect(
      mustReturnOneOrganizationInPayload("openid organizations organization"),
    ).toBeTruthy();
  });

  it("should return true for ProConnect Federation required scopes", () => {
    expect(
      mustReturnOneOrganizationInPayload(
        "openid uid given_name usual_name email siren siret organizational_unit belonging_population phone chorusdt idp_id idp_acr",
      ),
    ).toBeTruthy();
  });

  it("should return false for DataPass required scopes", () => {
    expect(
      mustReturnOneOrganizationInPayload(
        "openid email profile phone organizations",
      ),
    ).toBeFalsy();
  });
});
