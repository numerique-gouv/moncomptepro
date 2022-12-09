import { NextFunction, Request, Response } from 'express';
import getNotificationsFromRequest from '../services/get-notifications-from-request';
import { getUserOrganizations } from '../managers/organization';

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
