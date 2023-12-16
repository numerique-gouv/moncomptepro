import { NextFunction, Request, Response } from 'express';
import getNotificationsFromRequest from '../services/get-notifications-from-request';

export const getPasskeysController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.render('passkeys', {
      notifications: await getNotificationsFromRequest(req),
    });
  } catch (e) {
    next(e);
  }
};
