import { isEmpty } from 'lodash';

import notificationMessages from '../notificationMessages';
import { joinOrganization } from '../managers/organization';

export const getJoinOrganizationController = async (req, res, next) => {
  const notifications = notificationMessages[req.query.notification]
    ? [notificationMessages[req.query.notification]]
    : [];

  return res.render('join-organization', {
    notifications,
    csrfToken: req.csrfToken(),
    siretHint: req.query.siret_hint,
    disabled: req.query.notification === 'unable_to_auto_join_organization'
  });
};

export const postJoinOrganizationMiddleware = async (req, res, next) => {
  try {
    await joinOrganization(req.body.siret, req.session.user.id);

    next();
  } catch (error) {
    if (error.message === 'unable_to_auto_join_organization') {
      return res.redirect(
        `/users/join-organization?notification=${error.message}&siret_hint=${
          req.body.siret
        }`
      );
    }

    if (error.message === 'invalid_siret') {
      return res.redirect(
        `/users/join-organization?notification=${error.message}&siret_hint=${
          req.body.siret
        }`
      );
    }

    if (error.message === 'user_in_organization_already') {
      return res.redirect(
        `/users/join-organization?notification=${error.message}&siret_hint=${
          req.body.siret
        }`
      );
    }

    next(error);
  }
};
