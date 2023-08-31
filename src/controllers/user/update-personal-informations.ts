import { NextFunction, Request, Response } from 'express';
import getNotificationsFromRequest from '../../services/get-notifications-from-request';
import { z, ZodError } from 'zod';
import { updatePersonalInformations } from '../../managers/user';
import {
  nameSchema,
  phoneNumberSchema,
} from '../../services/custom-zod-schemas';
import {
  getUserFromLoggedInSession,
  updateUserInLoggedInSession,
} from '../../managers/session';
import { csrfToken } from '../../middlewares/csrf-protection';

export const getPersonalInformationsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = getUserFromLoggedInSession(req);
    return res.render('user/personal-information', {
      given_name: user.given_name,
      family_name: user.family_name,
      phone_number: user.phone_number,
      job: user.job,
      notifications: await getNotificationsFromRequest(req),
      csrfToken: csrfToken(req),
    });
  } catch (error) {
    next(error);
  }
};
export const getParamsForPostPersonalInformationsController = async (
  req: Request
) => {
  const schema = z.object({
    body: z.object({
      given_name: nameSchema(),
      family_name: nameSchema(),
      phone_number: phoneNumberSchema(),
      job: z.string().min(1),
    }),
  });

  return await schema.parseAsync({
    body: req.body,
  });
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

    const updatedUser = await updatePersonalInformations(
      getUserFromLoggedInSession(req).id,
      {
        given_name,
        family_name,
        phone_number,
        job,
      }
    );

    updateUserInLoggedInSession(req, updatedUser);

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.redirect(
        `/users/personal-information?notification=invalid_personal_informations`
      );
    }

    next(error);
  }
};
