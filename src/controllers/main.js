import { isEmpty } from 'lodash';

export const getHomeController = async (req, res, next) => {
  return res.render('home', { is_user_connected: !isEmpty(req.session.user) });
};

export const getHelpController = async (req, res, next) => {
  const email = req.session.user && req.session.user.email;
  return res.render('help', {
    email,
    csrfToken: email && req.csrfToken(),
  });
};
