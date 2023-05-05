import { NextFunction, Request, Response } from 'express';
import getNotificationsFromRequest from '../../services/get-notifications-from-request';
import { z, ZodError } from 'zod';
import { updatePersonalInformations } from '../../managers/user';
import { isEmailValid, isPhoneNumberValid } from '../../services/security';

export const getPersonalInformationsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.render('user/personal-information', {
      given_name: req.session.user!.given_name,
      family_name: req.session.user!.family_name,
      phone_number: req.session.user!.phone_number,
      job: req.session.user!.job,
      notifications: await getNotificationsFromRequest(req),
      csrfToken: req.csrfToken(),
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
      given_name: z.string().min(1),
      family_name: z.string().min(1),
      phone_number: z.string().refine(isPhoneNumberValid),
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

    req.session.user = await updatePersonalInformations(req.session.user!.id, {
      given_name,
      family_name,
      phone_number,
      job,
    });

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
