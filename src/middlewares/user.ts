import { NextFunction, Request, Response } from "express";
import { isEmpty } from "lodash";
import { getTrustedReferrerPath } from "../services/security";
import { needsEmailVerificationRenewal } from "../managers/user";
import {
  getOrganizationsByUserId,
  selectOrganization,
} from "../managers/organization/main";
import {
  greetForJoiningOrganization,
  isEligibleToSponsorship,
  notifyAllMembers,
} from "../managers/organization/authentication-by-peers";
import { getSelectedOrganizationId } from "../repositories/redis/selected-organization";
import { getUserOrganizationLink } from "../repositories/organization/getters";
import {
  getUserFromLoggedInSession,
  isWithinLoggedInSession,
} from "../managers/session";
import { isBrowserTrustedForUser } from "../managers/browser-authentication";

// redirect user to start sign in page if no email is available in session
export const checkEmailInSessionMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (isEmpty(req.session.email)) {
      return res.redirect(`/users/start-sign-in`);
    }

    return next();
  } catch (error) {
    next(error);
  }
};

// redirect user to login page if no active session is available
export const checkUserIsConnectedMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.method === "HEAD") {
      // From express documentation:
      // The app.get() function is automatically called for the HTTP HEAD method
      // in addition to the GET method if app.head() was not called for the path
      // before app.get().
      // We return empty response and the headers are sent to the client.
      return res.send();
    }

    if (!isWithinLoggedInSession(req)) {
      const rawReferrer =
        req.get("Referrer") ||
        (req.method === "GET" ? req.originalUrl : undefined);
      const referrerPath = getTrustedReferrerPath(rawReferrer);
      if (referrerPath) {
        req.session.referrerPath = referrerPath;

        return res.redirect(
          `/users/start-sign-in?notification=session_expired`,
        );
      }

      return res.redirect(`/users/start-sign-in`);
    }

    return next();
  } catch (error) {
    next(error);
  }
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

        if (!is_browser_trusted) {
          notification_param = "?notification=browser_not_trusted";
        }

        if (needs_email_verification_renewal) {
          notification_param = "?notification=email_verification_renewal";
        }

        return res.redirect(`/users/verify-email${notification_param}`);
      }

      return next();
    } catch (error) {
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

        const user_id = getUserFromLoggedInSession(req).id;

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
          if (
            await isEligibleToSponsorship(
              organizationThatNeedsAuthenticationByPeers,
            )
          ) {
            return res.redirect(
              `/users/choose-sponsor/${organizationThatNeedsAuthenticationByPeers.id}`,
            );
          }

          const link = await getUserOrganizationLink(
            organizationThatNeedsAuthenticationByPeers.id,
            user_id,
          );

          // link exists because we get the organization id from getOrganizationsByUserId above
          await notifyAllMembers(link!);
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
