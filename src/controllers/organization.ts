import {
  getOrganizationSuggestions,
  getUserOrganization,
  greetFirstOrganizationJoin,
  joinOrganization,
  quitOrganization,
} from '../managers/organization';
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
  InvalidSiretError,
  OrganizationNotFoundError,
  UnableToAutoJoinOrganizationError,
  UserInOrganizationAlreadyError,
} from '../errors';

export const getJoinOrganizationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z.object({
      query: z.object({
        siret_hint: siretSchema().optional(),
        is_external_hint: optionalBooleanSchema(),
        notification: z.string().optional(),
      }),
    });

    const {
      query: { is_external_hint, notification, siret_hint },
    } = await schema.parseAsync({
      query: req.query,
    });

    const { id: user_id, email } = req.session.user;

    const organizationSuggestions = await getOrganizationSuggestions({
      user_id,
      email,
    });

    return res.render('user/join-organization', {
      notifications: await getNotificationsFromRequest(req),
      csrfToken: req.csrfToken(),
      siretHint: siret_hint,
      isExternalHint: is_external_hint,
      organizationSuggestions,
      disabled: notification === 'unable_to_auto_join_organization',
    });
  } catch (error) {
    next(error);
  }
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
        is_external: optionalBooleanSchema(),
      }),
    });

    const {
      body: { is_external, siret },
    } = await schema.parseAsync({
      body: req.body,
    });

    await joinOrganization({
      siret,
      user_id: req.session.user.id,
      is_external,
    });

    const shouldWelcomeUser = await greetFirstOrganizationJoin({
      user_id: req.session.user.id,
    });

    if (shouldWelcomeUser) {
      return res.redirect(`/users/welcome`);
    }

    next();
  } catch (error) {
    if (error instanceof UnableToAutoJoinOrganizationError) {
      return res.redirect(
        `/users/join-organization?notification=unable_to_auto_join_organization&siret_hint=${req.body.siret}`
      );
    }

    if (
      error instanceof InvalidSiretError ||
      (error instanceof ZodError && hasErrorFromField(error, 'siret'))
    ) {
      return res.redirect(
        `/users/join-organization?notification=invalid_siret&siret_hint=${req.body.siret}`
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

export const getUserOrganizationController = async (
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

    const organization = await getUserOrganization({
      user_id: req.session.user.id,
      organization_id,
    });

    return res.render('user/user-organization', {
      notifications: await getNotificationsFromRequest(req),
      organization,
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    if (
      error instanceof OrganizationNotFoundError ||
      error instanceof ZodError
    ) {
      return res.redirect(
        `/manage-organizations?notification=organization_not_found`
      );
    }

    next(error);
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
      user_id: req.session.user.id,
      organization_id,
    });

    return res.redirect(
      `/manage-organizations?notification=quit_organization_success`
    );
  } catch (error) {
    next(error);
  }
};
