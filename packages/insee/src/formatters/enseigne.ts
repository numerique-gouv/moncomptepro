//

import { capitalize, isEmpty } from "lodash-es";

//

export const formatEnseigne = (...args: (string | null)[]) =>
  capitalize(args.filter((e) => !isEmpty(e)).join(" ")) || "";
