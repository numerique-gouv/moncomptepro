import { Request } from "express";
import { isEmpty } from "lodash";
import { deleteSelectedOrganizationId } from "../repositories/redis/selected-organization";
import { setIsTrustedBrowserFromLoggedInSession } from "./browser-authentication";
import { update } from "../repositories/user";

export const isWithinLoggedInSession = (req: Request) => {
  return !isEmpty(req.session.user);
};

export const createLoggedInSession = async (
  req: Request,
  user: User,
): Promise<null> => {
  // we store old session value to pass it to the new logged-in session
  // email will not be passed to the new session as it is not useful within logged session
  // csrfToken should not be passed to the new session for security reasons
  const {
    interactionId,
    mustReturnOneOrganizationInPayload,
    loginHint,
    referer,
  } = req.session;

  // as selected org is not stored in session
  // we delete this to avoid sync issues
  await deleteSelectedOrganizationId(user.id);

  return await new Promise((resolve, reject) => {
    // session will contain sensitive rights from now
    // we must regenerate session id to ensure it has not leaked
    req.session.regenerate(async (err) => {
      if (err) {
        reject(err);
      } else {
        req.session.user = await update(user.id, {
          sign_in_count: user.sign_in_count + 1,
          last_sign_in_at: new Date(),
        });
        // we restore previous session navigation values
        req.session.interactionId = interactionId;
        req.session.mustReturnOneOrganizationInPayload =
          mustReturnOneOrganizationInPayload;
        req.session.loginHint = loginHint;
        req.session.referer = referer;

        setIsTrustedBrowserFromLoggedInSession(req);

        resolve(null);
      }
    });
  });
};

export const getUserFromLoggedInSession = (req: Request) => {
  if (!isWithinLoggedInSession(req)) {
    throw Error("unable to get user info");
  }

  return req.session.user!;
};

export const updateUserInLoggedInSession = (req: Request, user: User) => {
  if (
    !isWithinLoggedInSession(req) ||
    getUserFromLoggedInSession(req).id !== user.id
  ) {
    throw Error("unable to update user info");
  }

  req.session.user = user;
};

export const destroyLoggedInSession = async (req: Request): Promise<null> => {
  if (isWithinLoggedInSession(req)) {
    await deleteSelectedOrganizationId(getUserFromLoggedInSession(req).id);
  }

  return await new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) {
        reject(err);
      } else {
        resolve(null);
      }
    });
  });
};
