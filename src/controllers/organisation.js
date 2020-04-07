import { isEmpty } from 'lodash';

import notificationMessages from '../notificationMessages';
import { joinOrganization } from '../models/organization-manager';

export const getJoinOrganizationController = async (req, res, next) => {
  if (isEmpty(req.session.user)) {
    // user must be logged in to access this page
    const notificationParams = req.query.notification
      ? `?notification=${req.query.notification}`
      : '';

    return res.redirect(
      `/users/sign-in${notificationParams}?referer=/users/join-organization`
    );
  }

  const notifications = notificationMessages[req.query.notification]
    ? [notificationMessages[req.query.notification]]
    : [];

  return res.render('join-organization', {
    notifications,
    csrfToken: req.csrfToken(),
    siretHint: req.query.siret_hint,
  });
};

export const postJoinOrganizationMiddleware = async (req, res, next) => {
  try {
    if (isEmpty(req.session.user)) {
      return next(new Error('user must be logged in to join an organization'));
    }

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
