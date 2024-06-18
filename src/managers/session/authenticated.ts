import { Request, Response } from "express";
import { isEmpty } from "lodash-es";
import {
  ENABLE_FIXED_AMR,
  RECENT_LOGIN_INTERVAL_IN_SECONDS,
} from "../../config/env";
import { UserNotLoggedInError } from "../../config/errors";
import { deleteSelectedOrganizationId } from "../../repositories/redis/selected-organization";
import { update } from "../../repositories/user";
import { isExpiredInSeconds } from "../../services/is-expired";
import {
  setBrowserAsTrustedForUser,
  setIsTrustedBrowserFromLoggedInSession,
} from "../browser-authentication";
import {
  AmrValue,
  AuthenticatedSessionData,
} from "../../types/express-session";
import {
  addAuthenticationMethodReference,
  isOneFactorAuthenticated,
  isTwoFactorAuthenticated,
} from "../../services/security";
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

const TRUSTED_AMR_VALUES: AmrValue[] = [
  "pop",
  "totp",
  "email-link",
  "email-otp",
];
export const createAuthenticatedSession = async (
  req: Request,
  res: Response,
  user: User,
  authenticationMethodReference: AmrValue,
): Promise<null> => {
  // we store old session value to pass it to the new logged-in session
  // email and needsInclusionconnectWelcomePage are not passed to the new session as it is not useful within logged session
  // csrfToken should not be passed to the new session for security reasons
  const {
    interactionId,
    mustReturnOneOrganizationInPayload,
    mustUse2FA,
    referrerPath,
  } = req.session;

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
        req.session.mustUse2FA = mustUse2FA;
        req.session.referrerPath = referrerPath;
        // new session reset amr
        req.session.amr = [];

        req.session.amr = addAuthenticationMethodReference(
          req.session.amr,
          authenticationMethodReference,
        );

        if (TRUSTED_AMR_VALUES.includes(authenticationMethodReference)) {
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

  if (TRUSTED_AMR_VALUES.includes(amr)) {
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

  return !isExpiredInSeconds(
    req.session.user.last_sign_in_at,
    RECENT_LOGIN_INTERVAL_IN_SECONDS,
  );
};

export const getSessionStandardizedAuthenticationMethodsReferences = (
  req: Request,
) => {
  if (ENABLE_FIXED_AMR) {
    return ["pwd"];
  }

  if (!isWithinAuthenticatedSession(req.session)) {
    throw new UserNotLoggedInError();
  }

  let standardizedAmr: string[] = [...req.session.amr];

  standardizedAmr = standardizedAmr.filter(
    (amr) => amr !== "uv" && amr !== "email-otp",
  );

  standardizedAmr = standardizedAmr.map((amr) =>
    amr === "email-link" ? "mail" : amr,
  );

  return standardizedAmr;
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
