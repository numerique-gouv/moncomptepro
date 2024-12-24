//

import type { OrganizationInfo } from "#src/types";
import type {
  FindBySirenHandler,
  FindBySiretHandler,
} from "@gouvfr-lasuite/proconnect.insee/entreprises";
import {
  InseeConnectionError,
  InseeNotFoundError,
} from "@gouvfr-lasuite/proconnect.insee/errors";
import {
  formatAdresseEtablissement,
  formatEnseigne,
  formatNomComplet,
  libelleFromCategoriesJuridiques,
  libelleFromCodeEffectif,
  libelleFromCodeNaf,
} from "@gouvfr-lasuite/proconnect.insee/formatters";
import type { InseeEtablissement } from "@gouvfr-lasuite/proconnect.insee/types";
import { to } from "await-to-js";
import { AxiosError } from "axios";
import { cloneDeep, set } from "lodash-es";

//

export class InvalidSiretError extends Error {}

//
type FactoryDependencies = {
  findBySiret: FindBySiretHandler;
  findBySiren: FindBySirenHandler;
};

export function getOrganizationInfoFactory(ctx: FactoryDependencies) {
  const { findBySiren, findBySiret } = ctx;

  const siret = [/^\d{14}$/, findBySiret] as const;
  const siren = [/^\d{9}$/, findBySiren] as const;

  const strategies = [siret, siren];

  return async function getOrganizationInfo(
    siretOrSiren: string,
  ): Promise<OrganizationInfo> {
    const [_, finder] =
      strategies.find(([pattern]) => pattern.test(siretOrSiren)) ?? [];

    if (!finder) {
      throw new InvalidSiretError();
    }

    const [finder_error, etablissement] = await to(finder(siretOrSiren));
    if (finder_error) {
      if (
        finder_error instanceof AxiosError &&
        finder_error.response &&
        [403, 404].includes(finder_error.response.status)
      ) {
        throw new InseeNotFoundError();
      }

      if (
        finder_error instanceof AxiosError &&
        (finder_error.code === "ECONNABORTED" ||
          finder_error.code === "ERR_BAD_RESPONSE" ||
          finder_error.code === "EAI_AGAIN")
      ) {
        throw new InseeConnectionError();
      }

      throw finder_error;
    }

    const { statutDiffusionEtablissement } = etablissement;

    if (statutDiffusionEtablissement === "N") {
      throw new InseeNotFoundError();
    }

    return etablissementToOrganizationInfo(
      statutDiffusionEtablissement === "P"
        ? hideNonDiffusibleData(etablissement)
        : etablissement,
    );
  };
}

function etablissementToOrganizationInfo(
  etablissement: InseeEtablissement,
): OrganizationInfo {
  const {
    adresseEtablissement,
    anneeEffectifsEtablissement,
    periodesEtablissement,
    siret: siretFromInseeApi,
    statutDiffusionEtablissement,
    trancheEffectifsEtablissement,
    uniteLegale,
  } = etablissement;

  const {
    categorieJuridiqueUniteLegale,
    denominationUniteLegale,
    sigleUniteLegale,
    nomUniteLegale,
    nomUsageUniteLegale,
    prenomUsuelUniteLegale,
    trancheEffectifsUniteLegale,
  } = uniteLegale;

  // get last period to obtain most recent data
  const {
    activitePrincipaleEtablissement,
    enseigne1Etablissement,
    enseigne2Etablissement,
    enseigne3Etablissement,
    etatAdministratifEtablissement,
  } = periodesEtablissement[0];

  const { codePostalEtablissement, codeCommuneEtablissement } =
    adresseEtablissement;

  const enseigne = formatEnseigne(
    enseigne1Etablissement,
    enseigne2Etablissement,
    enseigne3Etablissement,
  );

  const nomComplet = formatNomComplet({
    denominationUniteLegale,
    prenomUsuelUniteLegale,
    nomUniteLegale,
    nomUsageUniteLegale,
    sigleUniteLegale,
  });

  const organizationLabel = `${nomComplet}${enseigne ? ` - ${enseigne}` : ""}`;

  return {
    siret: siretFromInseeApi,
    libelle: organizationLabel,
    nomComplet,
    enseigne,
    trancheEffectifs: trancheEffectifsEtablissement,
    trancheEffectifsUniteLegale,
    libelleTrancheEffectif:
      libelleFromCodeEffectif(
        trancheEffectifsEtablissement,
        anneeEffectifsEtablissement,
      ) ?? "",
    etatAdministratif: etatAdministratifEtablissement,
    estActive: etatAdministratifEtablissement === "A",
    statutDiffusion: statutDiffusionEtablissement,
    estDiffusible: statutDiffusionEtablissement === "O",
    adresse: formatAdresseEtablissement(adresseEtablissement),
    codePostal: codePostalEtablissement,
    codeOfficielGeographique: codeCommuneEtablissement,
    activitePrincipale: activitePrincipaleEtablissement,
    libelleActivitePrincipale: libelleFromCodeNaf(
      activitePrincipaleEtablissement,
    ),
    categorieJuridique: `${categorieJuridiqueUniteLegale}`,
    libelleCategorieJuridique:
      libelleFromCategoriesJuridiques(categorieJuridiqueUniteLegale) ?? "",
  };
}

const hideNonDiffusibleData = (
  etablissement: InseeEtablissement,
): InseeEtablissement => {
  const hiddenEtablissement = cloneDeep(etablissement);
  set(hiddenEtablissement, "uniteLegale.denominationUniteLegale", null);
  set(hiddenEtablissement, "uniteLegale.sigleUniteLegale", null);
  set(hiddenEtablissement, "uniteLegale.denominationUsuelle1UniteLegale", null);
  set(hiddenEtablissement, "uniteLegale.denominationUsuelle2UniteLegale", null);
  set(hiddenEtablissement, "uniteLegale.denominationUsuelle3UniteLegale", null);
  set(hiddenEtablissement, "uniteLegale.sexeUniteLegale", null);
  set(hiddenEtablissement, "uniteLegale.nomUniteLegale", null);
  set(hiddenEtablissement, "uniteLegale.nomUsageUniteLegale", null);
  set(hiddenEtablissement, "uniteLegale.prenom1UniteLegale", null);
  set(hiddenEtablissement, "uniteLegale.prenom2UniteLegale", null);
  set(hiddenEtablissement, "uniteLegale.prenom3UniteLegale", null);
  set(hiddenEtablissement, "uniteLegale.prenom4UniteLegale", null);
  set(hiddenEtablissement, "uniteLegale.prenomUsuelUniteLegale", null);
  set(hiddenEtablissement, "uniteLegale.pseudonymeUniteLegale", null);
  set(
    hiddenEtablissement,
    "adresseEtablissement.complementAdresseEtablissement",
    null,
  );
  set(
    hiddenEtablissement,
    "adresseEtablissement.numeroVoieEtablissement",
    null,
  );
  set(
    hiddenEtablissement,
    "adresseEtablissement.indiceRepetitionEtablissement",
    null,
  );
  set(hiddenEtablissement, "adresseEtablissement.typeVoieEtablissement", null);
  set(
    hiddenEtablissement,
    "adresseEtablissement.libelleVoieEtablissement",
    null,
  );
  set(
    hiddenEtablissement,
    "adresse2Etablissement.complementAdresse2Etablissement",
    null,
  );
  set(
    hiddenEtablissement,
    "adresse2Etablissement.numeroVoie2Etablissement",
    null,
  );
  set(
    hiddenEtablissement,
    "adresse2Etablissement.indiceRepetition2Etablissement",
    null,
  );
  set(
    hiddenEtablissement,
    "adresse2Etablissement.typeVoie2Etablissement",
    null,
  );
  set(
    hiddenEtablissement,
    "adresse2Etablissement.libelleVoie2Etablissement",
    null,
  );

  set(
    hiddenEtablissement,
    "periodesEtablissement.0.enseigne1Etablissement",
    null,
  );
  set(
    hiddenEtablissement,
    "periodesEtablissement.0.enseigne2Etablissement",
    null,
  );
  set(
    hiddenEtablissement,
    "periodesEtablissement.0.enseigne3Etablissement",
    null,
  );
  set(
    hiddenEtablissement,
    "periodesEtablissement.0.denominationUsuelleEtablissement",
    null,
  );

  return hiddenEtablissement;
};
