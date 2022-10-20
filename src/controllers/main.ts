import { isEmpty } from 'lodash';
import { NextFunction, Request, Response } from 'express';
import getNotificationsFromRequest from '../services/get-notifications-from-request';

export const getHomeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.render('home', {
    notifications: await getNotificationsFromRequest(req),
    is_user_connected: !isEmpty(req.session.user),
  });
};

export const getHelpController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const email = req.session.user && req.session.user.email;
  return res.render('help', {
    email,
    csrfToken: email && req.csrfToken(),
  });
};
