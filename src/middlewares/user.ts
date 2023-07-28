import { NextFunction, Request, Response } from 'express';
import { isEmpty } from 'lodash';
import { isUrlTrusted } from '../services/security';
import { updateEmailAddressVerificationStatus } from '../managers/user';
import { isEligibleToSponsorship } from '../services/organization';
import { getOrganizationsByUserId } from '../managers/organization/main';
import {
  greetForJoiningOrganization,
  notifyAllMembers,
} from '../managers/organization/authentication-by-peers';
import { getSelectedOrganizationId } from '../repositories/redis/selected-organization';
import { getUserOrganizationLink } from '../repositories/organization/getters';

// redirect user to start sign in page if no email is available in session
export const checkEmailInSessionMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
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
  next: NextFunction
) => {
  try {
    if (isEmpty(req.session.user) && req.method === 'GET') {
      if (isUrlTrusted(req.originalUrl)) {
        req.session.referer = req.originalUrl;
      }

      return res.redirect(`/users/start-sign-in`);
    }

    if (isEmpty(req.session.user)) {
      return next(new Error('user must be logged in to perform this action'));
    }

    return next();
  } catch (error) {
    next(error);
  }
};

export const checkUserIsVerifiedMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) =>
  checkUserIsConnectedMiddleware(req, res, async error => {
    try {
      if (error) return next(error);

      const {
        user,
        needs_email_verification_renewal,
      } = await updateEmailAddressVerificationStatus(req.session.user!.email);

      req.session.user = user;

      if (!req.session.user!.email_verified) {
        const notification_param = needs_email_verification_renewal
          ? '?notification=email_verification_renewal'
          : '';

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
  next: NextFunction
) =>
  checkUserIsVerifiedMiddleware(req, res, async error => {
    try {
      if (error) return next(error);

      const { given_name, family_name, phone_number, job } = req.session.user!;
      if (
        isEmpty(given_name) ||
        isEmpty(family_name) ||
        isEmpty(phone_number) ||
        isEmpty(job)
      ) {
        return res.redirect('/users/personal-information');
      }

      return next();
    } catch (error) {
      next(error);
    }
  });

export const checkUserHasAtLeastOneOrganizationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) =>
  checkUserHasPersonalInformationsMiddleware(req, res, async error => {
    try {
      if (error) return next(error);

      if (isEmpty(await getOrganizationsByUserId(req.session.user!.id))) {
        return res.redirect('/users/join-organization');
      }

      return next();
    } catch (error) {
      next(error);
    }
  });

export const checkUserHasSelectedAnOrganizationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) =>
  checkUserHasAtLeastOneOrganizationMiddleware(req, res, async error => {
    try {
      if (error) return next(error);

      const selectedOrganizationId = await getSelectedOrganizationId(
        req.session.user!.id
      );

      if (
        req.session.mustReturnOneOrganizationInPayload &&
        !selectedOrganizationId
      ) {
        return res.redirect('/users/select-organization');
      }

      return next();
    } catch (error) {
      next(error);
    }
  });

export const checkUserHasNoPendingOfficialContactEmailVerificationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) =>
  checkUserHasSelectedAnOrganizationMiddleware(req, res, async error => {
    try {
      if (error) return next(error);

      const userOrganisations = await getOrganizationsByUserId(
        req.session.user!.id
      );

      let organizationThatNeedsOfficialContactEmailVerification;
      if (req.session.mustReturnOneOrganizationInPayload) {
        const selectedOrganizationId = await getSelectedOrganizationId(
          req.session.user!.id
        );

        organizationThatNeedsOfficialContactEmailVerification = userOrganisations.find(
          ({ id, needs_official_contact_email_verification }) =>
            needs_official_contact_email_verification &&
            id === selectedOrganizationId
        );
      } else {
        organizationThatNeedsOfficialContactEmailVerification = userOrganisations.find(
          ({ needs_official_contact_email_verification }) =>
            needs_official_contact_email_verification
        );
      }

      if (!isEmpty(organizationThatNeedsOfficialContactEmailVerification)) {
        return res.redirect(
          `/users/official-contact-email-verification/${organizationThatNeedsOfficialContactEmailVerification.id}`
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
  next: NextFunction
) =>
  checkUserHasNoPendingOfficialContactEmailVerificationMiddleware(
    req,
    res,
    async error => {
      try {
        if (error) return next(error);

        const userOrganisations = await getOrganizationsByUserId(
          req.session.user!.id
        );

        let organizationThatNeedsAuthenticationByPeers;
        if (req.session.mustReturnOneOrganizationInPayload) {
          const selectedOrganizationId = await getSelectedOrganizationId(
            req.session.user!.id
          );

          organizationThatNeedsAuthenticationByPeers = userOrganisations.find(
            ({ id, authentication_by_peers_type }) =>
              !authentication_by_peers_type && id === selectedOrganizationId
          );
        } else {
          organizationThatNeedsAuthenticationByPeers = userOrganisations.find(
            ({ authentication_by_peers_type }) => !authentication_by_peers_type
          );
        }

        if (!isEmpty(organizationThatNeedsAuthenticationByPeers)) {
          if (
            isEligibleToSponsorship(organizationThatNeedsAuthenticationByPeers)
          ) {
            return res.redirect(
              `/users/choose-sponsor/${organizationThatNeedsAuthenticationByPeers.id}`
            );
          }

          const link = await getUserOrganizationLink(
            organizationThatNeedsAuthenticationByPeers.id,
            req.session.user!.id
          );

          // link exists because we get the organization id from getOrganizationsByUserId above
          await notifyAllMembers(link!);
        }

        return next();
      } catch (error) {
        next(error);
      }
    }
  );

export const checkUserHasBeenGreetedForJoiningOrganizationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) =>
  checkUserHasBeenAuthenticatedByPeersMiddleware(req, res, async error => {
    try {
      if (error) return next(error);

      const userOrganisations = await getOrganizationsByUserId(
        req.session.user!.id
      );

      let organizationThatNeedsGreetings;
      if (req.session.mustReturnOneOrganizationInPayload) {
        const selectedOrganizationId = await getSelectedOrganizationId(
          req.session.user!.id
        );

        organizationThatNeedsGreetings = userOrganisations.find(
          ({ id, has_been_greeted }) =>
            !has_been_greeted && id === selectedOrganizationId
        );
      } else {
        organizationThatNeedsGreetings = userOrganisations.find(
          ({ id, has_been_greeted }) => !has_been_greeted
        );
      }

      if (!isEmpty(organizationThatNeedsGreetings)) {
        await greetForJoiningOrganization({
          user_id: req.session.user!.id,
          organization_id: organizationThatNeedsGreetings.id,
        });

        return res.redirect(
          `/users/welcome/${organizationThatNeedsGreetings.id}`
        );
      }

      return next();
    } catch (error) {
      next(error);
    }
  });

// check that user go through all requirements before issuing a session
export const checkUserSignInRequirementsMiddleware = checkUserHasBeenGreetedForJoiningOrganizationMiddleware;
