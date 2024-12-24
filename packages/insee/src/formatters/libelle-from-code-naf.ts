//

import { codesNaf, type CodeNaf } from "#src/data";

//

export const libelleFromCodeNaf = (codeNaf: CodeNaf, addCode = true) => {
  const label = codesNaf[codeNaf] || "Activité inconnue";
  return addCode && codeNaf ? `${codeNaf} - ${label}` : label;
};
