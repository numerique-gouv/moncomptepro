import type { Request } from "express";
import { UserNotLoggedInError } from "../../config/errors";
import { isWithinAuthenticatedSession } from "./authenticated";

export const setNeedsDirtyDSRedirect = (req: Request) => {
  if (!isWithinAuthenticatedSession(req.session)) {
    throw new UserNotLoggedInError();
  }

  req.session.needsDirtyDSRedirect = true;
};
export const getNeedsDirtyDSRedirect = (req: Request) => {
  if (!isWithinAuthenticatedSession(req.session)) {
    throw new UserNotLoggedInError();
  }

  return req.session.needsDirtyDSRedirect ?? false;
};
export const deleteNeedsDirtyDSRedirect = (req: Request) => {
  delete req.session.needsDirtyDSRedirect;
};
