//

import { setupServer } from "msw/node";
import {
  find_organization_by_siret,
  get_organization_by_siret,
} from "./entreprises/sirene/siret/index.js";
import { get_token } from "./token/index.js";

//

export const inseeMockServer = setupServer(
  find_organization_by_siret,
  get_organization_by_siret,
  get_token,
);
