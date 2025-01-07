//

import { categoriesJuridiques, type CategoriesJuridique } from "#src/data";

//

export const libelleFromCategoriesJuridiques = (
  categorie: CategoriesJuridique,
) => categoriesJuridiques[categorie] || null;
