//

import { codesEffectifs } from "#src/data";
import type { TrancheEffectifs } from "#src/types/tranche-effectifs.js";

//

export const libelleFromCodeEffectif = (
  codeEffectif: NonNullable<TrancheEffectifs>,
  anneeEffectif: string,
  characterEmployeurUniteLegale?: string,
) => {
  const libelle = codesEffectifs[codeEffectif];

  if (libelle && anneeEffectif) {
    return `${libelle}, en ${anneeEffectif}`;
  }
  if (libelle) {
    return libelle;
  }
  if (characterEmployeurUniteLegale === "N") {
    return "Unité non employeuse";
  }
  return null;
};
