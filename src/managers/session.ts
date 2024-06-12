import { Request, Response } from "express";
import { isEmpty } from "lodash-es";
import {
  RECENT_LOGIN_INTERVAL_IN_MINUTES,
  SYMMETRIC_ENCRYPTION_KEY,
} from "../config/env";
import {
  NoEmailFoundInLoggedOutSessionError,
  UserNotLoggedInError,
} from "../config/errors";
import { deleteSelectedOrganizationId } from "../repositories/redis/selected-organization";
import { findByEmail, update } from "../repositories/user";
import { isExpired } from "../services/is-expired";
import {
  setBrowserAsTrustedForUser,
  setIsTrustedBrowserFromLoggedInSession,
} from "./browser-authentication";
import {
  decryptSymmetric,
  encryptSymmetric,
} from "../services/symmetric-encryption";
import { AmrValue, AuthenticatedSessionData } from "../types/express-session";
import {
  addAuthenticationMethodReference,
  isOneFactorAuthenticated,
  isTwoFactorAuthenticated,
} from "../services/security";
import { Session, SessionData } from "express-session";

export const isWithinAuthenticatedSession = (
  session: Session & Partial<SessionData>,
): session is Session & Partial<SessionData> & AuthenticatedSessionData => {
  // testing req.session.amr should suffice, but as this is quite critical,
  // we must be sure of what we are doing here
  return (
    !isEmpty(session?.user) &&
    !isEmpty(session.amr) &&
    isOneFactorAuthenticated(session.amr!)
  );
};

export const createAuthenticatedSession = async (
  req: Request,
  res: Response,
  user: User,
  authenticationMethodReference: AmrValue,
): Promise<null> => {
  // we store old session value to pass it to the new logged-in session
  // email and needsInclusionconnectWelcomePage are not passed to the new session as it is not useful within logged session
  // csrfToken should not be passed to the new session for security reasons
  const { interactionId, mustReturnOneOrganizationInPayload, referrerPath } =
    req.session;

  // as selected org is not stored in session,
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
        // new session reset amr
        req.session.amr = [];

        req.session.amr = addAuthenticationMethodReference(
          req.session.amr,
          authenticationMethodReference,
        );

        if (
          authenticationMethodReference === "pop" ||
          authenticationMethodReference === "totp" ||
          authenticationMethodReference === "mail"
        ) {
          setBrowserAsTrustedForUser(req, res, user.id);
        }

        // as req.session.user has just been set,
        // this might alter the isTrustedBrowser flag on the req object.
        // We call this function to re-trigger the flag computation.
        setIsTrustedBrowserFromLoggedInSession(req);

        resolve(null);
      }
    });
  });
};

export const addAuthenticationMethodReferenceInSession = (
  req: Request,
  res: Response,
  updatedUser: User,
  amr: AmrValue,
) => {
  if (!isWithinAuthenticatedSession(req.session)) {
    throw new UserNotLoggedInError();
  }

  updateUserInAuthenticatedSession(req, updatedUser);

  req.session.amr = addAuthenticationMethodReference(req.session.amr, amr);

  if (amr === "pop" || amr === "totp" || amr === "mail") {
    setBrowserAsTrustedForUser(req, res, updatedUser.id);
  }
};

export const getUserFromAuthenticatedSession = (req: Request) => {
  if (!isWithinAuthenticatedSession(req.session)) {
    throw new UserNotLoggedInError();
  }

  return req.session.user;
};

export const updateUserInAuthenticatedSession = (req: Request, user: User) => {
  if (
    !isWithinAuthenticatedSession(req.session) ||
    getUserFromAuthenticatedSession(req).id !== user.id
  ) {
    throw new UserNotLoggedInError();
  }

  req.session.user = user;
};

export const isWithinTwoFactorAuthenticatedSession = (req: Request) => {
  if (!isWithinAuthenticatedSession(req.session)) {
    return false;
  }

  return isTwoFactorAuthenticated(req.session.amr);
};

export const isPasskeyAuthenticatedSession = (req: Request) => {
  if (!isWithinAuthenticatedSession(req.session)) {
    return false;
  }

  return req.session.amr.includes("pop");
};

export const hasUserAuthenticatedRecently = (req: Request) => {
  if (!isWithinAuthenticatedSession(req.session)) {
    throw new UserNotLoggedInError();
  }

  return !isExpired(
    req.session.user.last_sign_in_at,
    RECENT_LOGIN_INTERVAL_IN_MINUTES,
  );
};

export const getSessionAuthenticationMethodsReferences = (req: Request) => {
  if (!isWithinAuthenticatedSession(req.session)) {
    throw new UserNotLoggedInError();
  }

  return req.session.amr;
};

export const destroyAuthenticatedSession = async (
  req: Request,
): Promise<null> => {
  if (isWithinAuthenticatedSession(req.session)) {
    await deleteSelectedOrganizationId(getUserFromAuthenticatedSession(req).id);
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

export const setTemporaryTotpKey = (req: Request, totpKey: string) => {
  if (!isWithinAuthenticatedSession(req.session)) {
    throw new UserNotLoggedInError();
  }

  req.session.temporaryEncryptedTotpKey = encryptSymmetric(
    SYMMETRIC_ENCRYPTION_KEY,
    totpKey,
  );
};

export const getTemporaryTotpKey = (req: Request) => {
  if (!isWithinAuthenticatedSession(req.session)) {
    throw new UserNotLoggedInError();
  }

  if (!req.session.temporaryEncryptedTotpKey) {
    return null;
  }

  return decryptSymmetric(
    SYMMETRIC_ENCRYPTION_KEY,
    req.session.temporaryEncryptedTotpKey,
  );
};

export const deleteTemporaryTotpKey = (req: Request) => {
  delete req.session.temporaryEncryptedTotpKey;
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
