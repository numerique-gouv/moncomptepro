import nock from "nock";
import { describe, expect, it } from "vitest";
import { ApiAnnuaireNotFoundError } from "../src/config/errors";
import { getAnnuaireServicePublicContactEmail } from "../src/connectors/api-annuaire-service-public";
import invalidCogData from "./api-annuaire-service-public-data/invalid-cog.json";
import oneMairieData from "./api-annuaire-service-public-data/one-mairie.json";
import twoMairiesData from "./api-annuaire-service-public-data/two-mairies.json";

describe("getAnnuaireServicePublicContactEmail", () => {
  it("should throw an error for invalid cog", async () => {
    nock("https://api-lannuaire.service-public.fr")
      .get(
        `/api/explore/v2.1/catalog/datasets/api-lannuaire-administration/records?where=code_insee_commune LIKE "00000" and pivot LIKE "mairie"`,
      )
      .reply(200, invalidCogData);
    await expect(
      getAnnuaireServicePublicContactEmail("00000", "00000"),
    ).rejects.toThrow(ApiAnnuaireNotFoundError);
  });
  it("should return a valid email", async () => {
    nock("https://api-lannuaire.service-public.fr")
      .get(
        `/api/explore/v2.1/catalog/datasets/api-lannuaire-administration/records?where=code_insee_commune LIKE "15014" and pivot LIKE "mairie"`,
      )
      .reply(200, oneMairieData);
    await expect(
      getAnnuaireServicePublicContactEmail("15014", "15000"),
    ).resolves.toBe("administration@aurillac.fr");
  });
  it("should return valid email for two mairies with the same Code Officiel Geographique", async () => {
    nock("https://api-lannuaire.service-public.fr")
      .get(
        `/api/explore/v2.1/catalog/datasets/api-lannuaire-administration/records?where=code_insee_commune LIKE "38253" and pivot LIKE "mairie"`,
      )
      .reply(200, twoMairiesData);
    await expect(
      getAnnuaireServicePublicContactEmail("38253", "38860"),
    ).resolves.toBe("accueil@mairie2alpes.fr");
  });
});
