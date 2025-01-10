//

import { codesVoies, type CodeVoie } from "#src/data";
import type { InseeEtablissement } from "#src/types";
import { capitalize } from "lodash-es";

//

export const formatAdresseEtablissement = ({
  complementAdresseEtablissement,
  numeroVoieEtablissement,
  indiceRepetitionEtablissement,
  typeVoieEtablissement,
  libelleVoieEtablissement,
  distributionSpecialeEtablissement,
  codePostalEtablissement,
  libelleCommuneEtablissement,
  codeCedexEtablissement,
  libelleCedexEtablissement,
  libelleCommuneEtrangerEtablissement,
  codePaysEtrangerEtablissement,
  libellePaysEtrangerEtablissement,
}: InseeEtablissement["adresseEtablissement"]) => {
  if (
    !complementAdresseEtablissement &&
    !numeroVoieEtablissement &&
    !typeVoieEtablissement &&
    !libelleCommuneEtablissement &&
    !distributionSpecialeEtablissement &&
    !codePostalEtablissement &&
    !codeCedexEtablissement &&
    !libelleVoieEtablissement &&
    !libelleCommuneEtrangerEtablissement &&
    !codePaysEtrangerEtablissement &&
    !libellePaysEtrangerEtablissement
  ) {
    return "";
  }

  const fullLibelleFromTypeVoie = libelleFromTypeVoie(typeVoieEtablissement);

  return [
    wrapWord(complementAdresseEtablissement, ", ", true),
    wrapWord(numeroVoieEtablissement),
    wrapWord(indiceRepetitionEtablissement),
    wrapWord(fullLibelleFromTypeVoie),
    wrapWord(libelleVoieEtablissement, ", "),
    wrapWord(distributionSpecialeEtablissement, ", "),
    wrapWord(codePostalEtablissement || codeCedexEtablissement),
    wrapWord(
      libelleCommuneEtablissement ||
        libelleCedexEtablissement ||
        libelleCommuneEtrangerEtablissement,
      "",
      true,
    ),
    libellePaysEtrangerEtablissement
      ? `, ${wrapWord(libellePaysEtrangerEtablissement, "", true)}`
      : "",
  ].join("");
};

const libelleFromTypeVoie = (codeVoie: CodeVoie) => {
  return codesVoies[codeVoie] || codeVoie;
};

const wrapWord = (word: string | null, punct = " ", caps = false) => {
  if (!word) {
    return "";
  }
  if (caps) {
    return capitalize(word) + punct;
  }
  return word.toString().toLowerCase() + punct;
};
