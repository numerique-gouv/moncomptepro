import { NextFunction, Request, Response } from 'express';

export const getWelcomeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.render('user/welcome', {
    csrfToken: req.csrfToken(),
  });
};
