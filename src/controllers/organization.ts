import { NextFunction, Request, Response } from 'express';
import getNotificationsFromRequest from '../services/get-notifications-from-request';
import { z, ZodError } from 'zod';
import {
  idSchema,
  optionalBooleanSchema,
  siretSchema,
} from '../services/custom-zod-schemas';
import hasErrorFromField from '../services/has-error-from-field';
import {
  InseeNotActiveError,
  InseeTimeoutError,
  InvalidSiretError,
  UnableToAutoJoinOrganizationError,
  UserAlreadyAskedToJoinOrganizationError,
  UserInOrganizationAlreadyError,
} from '../errors';
import {
  quitOrganization,
  selectOrganization,
} from '../managers/organization/main';
import {
  doSuggestOrganizations,
  getOrganizationSuggestions,
  joinOrganization,
} from '../managers/organization/join';
import { getUserFromLoggedInSession } from '../managers/session';

export const getJoinOrganizationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z.object({
      query: z.object({
        siret_hint: z.string().optional(),
        notification: z.string().optional(),
        do_not_propose_suggestions: optionalBooleanSchema(),
      }),
    });

    const {
      query: { notification, siret_hint, do_not_propose_suggestions },
    } = await schema.parseAsync({
      query: req.query,
    });

    const { id: user_id, email } = getUserFromLoggedInSession(req);

    if (
      !siret_hint &&
      !notification &&
      !do_not_propose_suggestions &&
      (await doSuggestOrganizations({ user_id, email }))
    ) {
      return res.redirect('/users/organization-suggestions');
    }

    return res.render('user/join-organization', {
      notifications: await getNotificationsFromRequest(req),
      csrfToken: req.csrfToken(),
      siretHint: siret_hint,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrganizationSuggestionsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id: user_id, email } = getUserFromLoggedInSession(req);

  const organizationSuggestions = await getOrganizationSuggestions({
    user_id,
    email,
  });

  return res.render('user/organization-suggestions', {
    organizationSuggestions,
    csrfToken: req.csrfToken(),
  });
};

export const postJoinOrganizationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z.object({
      body: z.object({
        siret: siretSchema(),
      }),
    });

    const {
      body: { siret },
    } = await schema.parseAsync({
      body: req.body,
    });

    const userOrganizationLink = await joinOrganization({
      siret,
      user_id: getUserFromLoggedInSession(req).id,
    });

    if (req.session.mustReturnOneOrganizationInPayload) {
      await selectOrganization({
        user_id: getUserFromLoggedInSession(req).id,
        organization_id: userOrganizationLink.organization_id,
      });
    }

    next();
  } catch (error) {
    if (
      error instanceof UnableToAutoJoinOrganizationError ||
      error instanceof UserAlreadyAskedToJoinOrganizationError
    ) {
      return res.redirect(`/users/unable-to-auto-join-organization`);
    }

    if (
      error instanceof InvalidSiretError ||
      error instanceof InseeNotActiveError ||
      (error instanceof ZodError && hasErrorFromField(error, 'siret'))
    ) {
      return res.redirect(
        `/users/join-organization?notification=invalid_siret&siret_hint=${req.body.siret}`
      );
    }

    if (error instanceof InseeTimeoutError) {
      return res.redirect(
        `/users/join-organization?notification=insee_timeout&siret_hint=${req.body.siret}`
      );
    }

    if (error instanceof UserInOrganizationAlreadyError) {
      return res.redirect(
        `/users/join-organization?notification=user_in_organization_already&siret_hint=${req.body.siret}`
      );
    }

    next(error);
  }
};

export const getUnableToAutoJoinOrganizationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.render('user/unable-to-auto-join-organization');
  } catch (e) {
    next(e);
  }
};

export const postQuitUserOrganizationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z.object({
      params: z.object({
        id: idSchema(),
      }),
    });

    const {
      params: { id: organization_id },
    } = await schema.parseAsync({
      params: req.params,
    });

    await quitOrganization({
      user_id: getUserFromLoggedInSession(req).id,
      organization_id,
    });

    return res.redirect(
      `/manage-organizations?notification=quit_organization_success`
    );
  } catch (error) {
    next(error);
  }
};
