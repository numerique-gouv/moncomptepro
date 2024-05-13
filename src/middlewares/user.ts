import { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { isEmpty } from "lodash-es";
import { PAIR_AUTHENTICATION_WHITELIST } from "../config/env";
import { UserNotFoundError } from "../config/errors";
import { isBrowserTrustedForUser } from "../managers/browser-authentication";
import {
  greetForJoiningOrganization,
  markAsWhitelisted,
  notifyAllMembers,
} from "../managers/organization/authentication-by-peers";
import {
  getOrganizationsByUserId,
  selectOrganization,
} from "../managers/organization/main";
import {
  destroyLoggedInSession,
  getEmailFromLoggedOutSession,
  getUserFromLoggedInSession,
  hasUserLoggedInRecently,
  isWithinLoggedInSession,
} from "../managers/session";
import { needsEmailVerificationRenewal } from "../managers/user";
import { getInternalActiveUsers } from "../repositories/organization/getters";
import { getSelectedOrganizationId } from "../repositories/redis/selected-organization";
import { getTrustedReferrerPath } from "../services/security";
import { getEmailDomain } from "../services/uses-a-free-email-provider";
import { usesAuthHeaders } from "../services/uses-auth-headers";

const getReferrerPath = (req: Request) => {
  // If the method is not GET (ex: POST), then the referrer must be taken from
  // the referrer header. This ensures the referrerPath can be redirected to.
  const originPath =
    req.method === "GET" ? getTrustedReferrerPath(req.originalUrl) : null;
  const referrerPath = getTrustedReferrerPath(req.get("Referrer"));

  return originPath || referrerPath || undefined;
};

export const checkIsUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (usesAuthHeaders(req)) {
      return next(
        new HttpErrors.Forbidden(
          "Access denied. The requested resource does not require authentication.",
        ),
      );
    }

    return next();
  } catch (error) {
    next(error);
  }
};

// redirect user to start sign in page if no email is available in session
export const checkEmailInSessionMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await checkIsUser(req, res, async (error) => {
    try {
      if (error) return next(error);

      if (isEmpty(getEmailFromLoggedOutSession(req))) {
        return res.redirect(`/users/start-sign-in`);
      }

      return next();
    } catch (error) {
      next(error);
    }
  });
};

export const checkCredentialPromptRequirementsMiddleware =
  checkEmailInSessionMiddleware;

// redirect user to login page if no active session is available
export const checkUserIsConnectedMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await checkIsUser(req, res, async (error) => {
    try {
      if (error) return next(error);

      if (req.method === "HEAD") {
        // From express documentation:
        // The app.get() function is automatically called for the HTTP HEAD method
        // in addition to the GET method if app.head() was not called for the path
        // before app.get().
        // We return empty response and the headers are sent to the client.
        return res.send();
      }

      if (!isWithinLoggedInSession(req)) {
        const referrerPath = getReferrerPath(req);
        if (referrerPath) {
          req.session.referrerPath = referrerPath;
        }

        return res.redirect(`/users/start-sign-in`);
      }

      return next();
    } catch (error) {
      next(error);
    }
  });
};

export const checkUserIsVerifiedMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) =>
  checkUserIsConnectedMiddleware(req, res, async (error) => {
    try {
      if (error) return next(error);

      const { id, email, email_verified } = getUserFromLoggedInSession(req);

      const needs_email_verification_renewal =
        await needsEmailVerificationRenewal(email);

      const is_browser_trusted = isBrowserTrustedForUser(req, id);

      if (
        !email_verified ||
        needs_email_verification_renewal ||
        !is_browser_trusted
      ) {
        let notification_param = "";

        if (email_verified && needs_email_verification_renewal) {
          notification_param = "?notification=email_verification_renewal";
        } else if (!is_browser_trusted) {
          notification_param = "?notification=browser_not_trusted";
        }

        return res.redirect(`/users/verify-email${notification_param}`);
      }

      return next();
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        // The user has an active session but is not in the database anymore
        await destroyLoggedInSession(req);
        next(new HttpErrors.Unauthorized());
      }

      next(error);
    }
  });

export const checkUserHasPersonalInformationsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) =>
  checkUserIsVerifiedMiddleware(req, res, async (error) => {
    try {
      if (error) return next(error);

      const { given_name, family_name, phone_number, job } =
        getUserFromLoggedInSession(req);
      if (isEmpty(given_name) || isEmpty(family_name) || isEmpty(job)) {
        return res.redirect("/users/personal-information");
      }

      return next();
    } catch (error) {
      next(error);
    }
  });

export const checkUserHasAtLeastOneOrganizationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) =>
  checkUserHasPersonalInformationsMiddleware(req, res, async (error) => {
    try {
      if (error) return next(error);

      if (
        isEmpty(
          await getOrganizationsByUserId(getUserFromLoggedInSession(req).id),
        )
      ) {
        return res.redirect("/users/join-organization");
      }

      return next();
    } catch (error) {
      next(error);
    }
  });

export const checkUserCanAccessAppMiddleware =
  checkUserHasAtLeastOneOrganizationMiddleware;

export const checkUserHasLoggedInRecentlyMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) =>
  checkUserCanAccessAppMiddleware(req, res, async (error) => {
    try {
      if (error) return next(error);

      const hasLoggedInRecently = hasUserLoggedInRecently(req);

      if (!hasLoggedInRecently) {
        req.session.referrerPath = getReferrerPath(req);

        return res.redirect(`/users/start-sign-in?notification=login_required`);
      }

      next();
    } catch (error) {
      next(error);
    }
  });

export const checkUserHasSelectedAnOrganizationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) =>
  checkUserHasAtLeastOneOrganizationMiddleware(req, res, async (error) => {
    try {
      if (error) return next(error);

      const selectedOrganizationId = await getSelectedOrganizationId(
        getUserFromLoggedInSession(req).id,
      );

      if (
        req.session.mustReturnOneOrganizationInPayload &&
        !selectedOrganizationId
      ) {
        const userOrganisations = await getOrganizationsByUserId(
          getUserFromLoggedInSession(req).id,
        );

        if (userOrganisations.length === 1) {
          await selectOrganization({
            user_id: getUserFromLoggedInSession(req).id,
            organization_id: userOrganisations[0].id,
          });
        } else {
          return res.redirect("/users/select-organization");
        }
      }

      return next();
    } catch (error) {
      next(error);
    }
  });

export const checkUserHasNoPendingOfficialContactEmailVerificationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) =>
  checkUserHasSelectedAnOrganizationMiddleware(req, res, async (error) => {
    try {
      if (error) return next(error);

      const userOrganisations = await getOrganizationsByUserId(
        getUserFromLoggedInSession(req).id,
      );

      let organizationThatNeedsOfficialContactEmailVerification;
      if (req.session.mustReturnOneOrganizationInPayload) {
        const selectedOrganizationId = await getSelectedOrganizationId(
          getUserFromLoggedInSession(req).id,
        );

        organizationThatNeedsOfficialContactEmailVerification =
          userOrganisations.find(
            ({ id, needs_official_contact_email_verification }) =>
              needs_official_contact_email_verification &&
              id === selectedOrganizationId,
          );
      } else {
        organizationThatNeedsOfficialContactEmailVerification =
          userOrganisations.find(
            ({ needs_official_contact_email_verification }) =>
              needs_official_contact_email_verification,
          );
      }

      if (!isEmpty(organizationThatNeedsOfficialContactEmailVerification)) {
        return res.redirect(
          `/users/official-contact-email-verification/${organizationThatNeedsOfficialContactEmailVerification.id}`,
        );
      }

      return next();
    } catch (error) {
      next(error);
    }
  });

export const checkUserHasBeenAuthenticatedByPeersMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) =>
  checkUserHasNoPendingOfficialContactEmailVerificationMiddleware(
    req,
    res,
    async (error) => {
      try {
        if (error) return next(error);

        const { id: user_id, email } = getUserFromLoggedInSession(req);

        const userOrganisations = await getOrganizationsByUserId(user_id);

        let organizationThatNeedsAuthenticationByPeers;
        if (req.session.mustReturnOneOrganizationInPayload) {
          const selectedOrganizationId =
            await getSelectedOrganizationId(user_id);

          organizationThatNeedsAuthenticationByPeers = userOrganisations.find(
            ({ id, authentication_by_peers_type }) =>
              !authentication_by_peers_type && id === selectedOrganizationId,
          );
        } else {
          organizationThatNeedsAuthenticationByPeers = userOrganisations.find(
            ({ authentication_by_peers_type }) => !authentication_by_peers_type,
          );
        }

        if (!isEmpty(organizationThatNeedsAuthenticationByPeers)) {
          const organization_id = organizationThatNeedsAuthenticationByPeers.id;
          const internalActiveUsers =
            await getInternalActiveUsers(organization_id);
          const otherInternalUsers = internalActiveUsers.filter(
            ({ email: e }) => e !== email,
          );

          if (PAIR_AUTHENTICATION_WHITELIST.includes(getEmailDomain(email))) {
            await markAsWhitelisted({ user_id, organization_id });
          } else if (otherInternalUsers.length > 0) {
            return res.redirect(`/users/choose-sponsor/${organization_id}`);
          } else {
            await notifyAllMembers({ user_id, organization_id });
          }
        }

        return next();
      } catch (error) {
        next(error);
      }
    },
  );

export const checkUserHasBeenGreetedForJoiningOrganizationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) =>
  checkUserHasBeenAuthenticatedByPeersMiddleware(req, res, async (error) => {
    try {
      if (error) return next(error);

      const userOrganisations = await getOrganizationsByUserId(
        getUserFromLoggedInSession(req).id,
      );

      let organizationThatNeedsGreetings;
      if (req.session.mustReturnOneOrganizationInPayload) {
        const selectedOrganizationId = await getSelectedOrganizationId(
          getUserFromLoggedInSession(req).id,
        );

        organizationThatNeedsGreetings = userOrganisations.find(
          ({ id, has_been_greeted }) =>
            !has_been_greeted && id === selectedOrganizationId,
        );
      } else {
        organizationThatNeedsGreetings = userOrganisations.find(
          ({ id, has_been_greeted }) => !has_been_greeted,
        );
      }

      if (!isEmpty(organizationThatNeedsGreetings)) {
        await greetForJoiningOrganization({
          user_id: getUserFromLoggedInSession(req).id,
          organization_id: organizationThatNeedsGreetings.id,
        });

        return res.redirect(
          `/users/welcome/${organizationThatNeedsGreetings.id}`,
        );
      }

      return next();
    } catch (error) {
      next(error);
    }
  });

// check that user go through all requirements before issuing a session
export const checkUserSignInRequirementsMiddleware =
  checkUserHasBeenGreetedForJoiningOrganizationMiddleware;
