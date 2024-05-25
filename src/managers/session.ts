import { Request } from "express";
import { isEmpty } from "lodash-es";
import { RECENT_LOGIN_INTERVAL_IN_MINUTES } from "../config/env";
import {
  NoEmailFoundInLoggedOutSessionError,
  UserNotLoggedInError,
} from "../config/errors";
import { deleteSelectedOrganizationId } from "../repositories/redis/selected-organization";
import { findByEmail, update } from "../repositories/user";
import { isExpired } from "../services/is-expired";
import { setIsTrustedBrowserFromLoggedInSession } from "./browser-authentication";

export const isWithinLoggedInSession = (req: Request) => {
  return !isEmpty(req.session?.user);
};

export const createLoggedInSession = async (
  req: Request,
  user: User,
): Promise<null> => {
  // we store old session value to pass it to the new logged-in session
  // email and needsInclusionconnectWelcomePage are not passed to the new session as it is not useful within logged session
  // csrfToken should not be passed to the new session for security reasons
  const { interactionId, mustReturnOneOrganizationInPayload, referrerPath } =
    req.session;

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
        req.session.referrerPath = referrerPath;

        setIsTrustedBrowserFromLoggedInSession(req);

        resolve(null);
      }
    });
  });
};

export const getUserFromLoggedInSession = (req: Request) => {
  if (!isWithinLoggedInSession(req)) {
    throw new UserNotLoggedInError();
  }

  return req.session.user!;
};

export const updateUserInLoggedInSession = (req: Request, user: User) => {
  if (
    !isWithinLoggedInSession(req) ||
    getUserFromLoggedInSession(req).id !== user.id
  ) {
    throw new UserNotLoggedInError();
  }

  req.session.user = user;
  delete req.session.temporaryTotpKey;
};

export const setTemporaryTotpKey = (req: Request, totpKey: string) => {
  if (!isWithinLoggedInSession(req)) {
    throw new UserNotLoggedInError();
  }

  req.session.temporaryTotpKey = totpKey;
};

export const getTemporaryTotpKey = (req: Request) => {
  if (!isWithinLoggedInSession(req)) {
    throw new UserNotLoggedInError();
  }

  return req.session.temporaryTotpKey;
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

export const hasUserLoggedInRecently = (req: Request) => {
  if (!isWithinLoggedInSession(req)) {
    throw new UserNotLoggedInError();
  }

  return !isExpired(
    req.session.user!.last_sign_in_at,
    RECENT_LOGIN_INTERVAL_IN_MINUTES,
  );
};

export const getEmailFromLoggedOutSession = (req: Request) => {
  return req.session.email;
};

export const setEmailInLoggedOutSession = (req: Request, email: string) => {
  req.session.email = email;

  return email;
};

export const getPartialUserFromLoggedOutSession = (req: Request) => {
  return {
    email: req.session.email,
    needsInclusionconnectWelcomePage:
      req.session.needsInclusionconnectWelcomePage,
  };
};

export const setPartialUserFromLoggedOutSession = (
  req: Request,
  {
    email,
    needsInclusionconnectWelcomePage,
  }: { email: string; needsInclusionconnectWelcomePage: boolean },
) => {
  req.session.email = email;
  req.session.needsInclusionconnectWelcomePage =
    needsInclusionconnectWelcomePage;
};

export const updatePartialUserFromLoggedOutSession = async (
  req: Request,
  {
    needs_inclusionconnect_welcome_page,
  }: { needs_inclusionconnect_welcome_page: boolean },
): Promise<null | {
  email: string;
  needs_inclusionconnect_welcome_page: boolean;
}> => {
  if (!req.session.email) {
    throw new NoEmailFoundInLoggedOutSessionError();
  }

  req.session.needsInclusionconnectWelcomePage =
    needs_inclusionconnect_welcome_page;

  const user = await findByEmail(req.session.email);

  if (isEmpty(user)) {
    return null;
  }

  await update(user!.id, { needs_inclusionconnect_welcome_page });

  return { email: req.session.email, needs_inclusionconnect_welcome_page };
};
