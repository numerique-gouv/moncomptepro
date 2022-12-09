import { NextFunction, Request, Response } from 'express';
import getNotificationsFromRequest from '../services/get-notifications-from-request';
import { z, ZodError } from 'zod';
import { updatePersonalInformations } from '../managers/user';
import { getParamsForPostPersonalInformationsController } from './user';
import { getUserOrganizations } from '../managers/organization';
import notificationMessages from '../notification-messages';

export const getHomeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.render('home', {
    notifications: await getNotificationsFromRequest(req),
    oidc_clients: [
      {
        name: 'DataPass',
        link: 'https://datapass.api.gouv.fr',
        description:
          'Centralisez vos demandes d’habilitations juridiques pour accéder aux données et services en accès restreint.',
      },
      {
        name: 'API Particulier',
        link: 'https://mon.portail.api.gouv.fr/',
        description:
          'Bouquet de données proposé pour simplifier les démarches administratives.',
      },
      {
        name: 'API Entreprise',
        link: 'https://dashboard.entreprise.api.gouv.fr',
        description:
          'Permet aux entités administratives d’accéder aux données et aux documents administratifs des entreprises et des associations, afin de simplifier leurs démarches.',
      },
      {
        name: 'HubEE',
        link: 'https://hubee.numerique.gouv.fr/',
        description:
          'Portail du Hub d’Échange de l’État au sein duquel vous allez pouvoir accéder aux démarches transmises par les usagers',
      },
    ],
  });
};

export const getPersonalInformationsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.render('personal-information', {
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
    if (
      (error instanceof Error &&
        error.message === 'invalid_personal_informations') ||
      error instanceof ZodError
    ) {
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
