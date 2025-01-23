//

import { setupServer } from "msw/node";
import { get_operators } from "./v1/website/[website_id]/operators/list/index.js";

//

export const crispMockServer = setupServer(get_operators);
