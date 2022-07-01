import { isEmpty } from 'lodash';

export const getHomeController = async (req, res, next) => {
  if (isEmpty(req.session.user)) {
    console.log('user not connected');
  }

  return res.render('home', {});
};

export const getHelpController = async (req, res, next) => {
  const email = req.session.user && req.session.user.email;
  return res.render('help', {
    email,
    csrfToken: email && req.csrfToken(),
  });
};
