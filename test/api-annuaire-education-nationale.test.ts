import nock from "nock";
import { describe, expect, it } from "vitest";
import { ApiAnnuaireNotFoundError } from "../src/config/errors";
import { getAnnuaireEducationNationaleContactEmail } from "../src/connectors/api-annuaire-education-nationale";
import noResult from "./api-annuaire-education-nationale-data/no-result.json";
import twoEtablissementsData from "./api-annuaire-education-nationale-data/two-etablissements.json";

describe("getAnnuaireEducationNationaleContactEmail", () => {
  it("should throw an error when no result is found", async () => {
    nock("https://data.education.gouv.fr")
      .get(
        "/api/v2/catalog/datasets/fr-en-annuaire-education/records?where=siren_siret%3D77672253000024",
      )
      .reply(200, noResult);
    await expect(
      getAnnuaireEducationNationaleContactEmail("77672253000024"),
    ).rejects.toThrow(ApiAnnuaireNotFoundError);
  });
  it("should return valid email for a college and a lycee sharing the same SIRET", async () => {
    nock("https://data.education.gouv.fr")
      .get(
        "/api/v2/catalog/datasets/fr-en-annuaire-education/records?where=siren_siret%3D77672253000040",
      )
      .reply(200, twoEtablissementsData);
    await expect(
      getAnnuaireEducationNationaleContactEmail("77672253000040"),
    ).resolves.toBe("jeannedarc.millau@gmail.com");
  });
});
