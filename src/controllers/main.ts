import { NextFunction, Request, Response } from 'express';
import getNotificationsFromRequest from '../services/get-notifications-from-request';
import { ZodError } from 'zod';
import { updatePersonalInformations } from '../managers/user';
import { getParamsForPostPersonalInformationsController } from './user';
import { getUserOrganizations } from '../managers/organization';
import notificationMessages from '../notification-messages';
import { getClientsOrderedByConnectionCount } from '../managers/oidc-client';

export const getHomeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const oidc_clients = await getClientsOrderedByConnectionCount(
    req.session.user.id
  );

  return res.render('home', {
    notifications: await getNotificationsFromRequest(req),
    oidc_clients,
  });
};

export const getPersonalInformationsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.render('personal-information', {
      email: req.session.user.email,
      given_name: req.session.user.given_name,
      family_name: req.session.user.family_name,
      phone_number: req.session.user.phone_number,
      job: req.session.user.job,
      notifications: await getNotificationsFromRequest(req),
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    next(error);
  }
};

export const postPersonalInformationsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      body: { given_name, family_name, phone_number, job },
    } = await getParamsForPostPersonalInformationsController(req);

    req.session.user = await updatePersonalInformations(req.session.user.id, {
      given_name,
      family_name,
      phone_number,
      job,
    });

    return res.render('personal-information', {
      email: req.session.user.email,
      given_name: req.session.user.given_name,
      family_name: req.session.user.family_name,
      phone_number: req.session.user.phone_number,
      job: req.session.user.job,
      notifications: [
        notificationMessages['personal_information_update_success'],
      ],
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.redirect(
        `/personal-information?notification=invalid_personal_informations`
      );
    }

    next(error);
  }
};

export const getManageOrganizationsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      userOrganizations,
      pendingUserOrganizations,
    } = await getUserOrganizations({ user_id: req.session.user.id });

    return res.render('manage-organizations', {
      notifications: await getNotificationsFromRequest(req),
      userOrganizations,
      pendingUserOrganizations,
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    next(error);
  }
};

export const getResetPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.render('reset-password', {
      notifications: await getNotificationsFromRequest(req),
      loginHint: req.session.user.email,
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    next(error);
  }
};

export const getHelpController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const email = req.session.user?.email;
  return res.render('help', {
    email,
    csrfToken: email && req.csrfToken(),
  });
};
