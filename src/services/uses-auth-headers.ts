import type { Request } from "express";
import { isEmpty } from "lodash-es";

export const usesAuthHeaders = (req: Request) => {
  return !isEmpty(req.headers.authorization);
};
