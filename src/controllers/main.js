import { isEmpty } from 'lodash';
import notificationMessages from '../notificationMessages';

export const getHomeController = async (req, res, next) => {
  const notifications = notificationMessages[req.query.notification]
    ? [notificationMessages[req.query.notification]]
    : [];

  return res.render('home', {
    notifications,
    is_user_connected: !isEmpty(req.session.user),
  });
};

export const getHelpController = async (req, res, next) => {
  const email = req.session.user && req.session.user.email;
  return res.render('help', {
    email,
    csrfToken: email && req.csrfToken(),
  });
};
