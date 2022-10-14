import createError from 'http-errors';
import { isEmpty } from 'lodash';
import { getOrganizationInfo } from '../connectors/api-sirene';
import notificationMessages from '../notification-messages';
import { isSiretValid } from '../services/security';
import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

const schema = z.object({
  query: z.object({
    siret: z
      .string({
        required_error: notificationMessages['invalid_siret'].description,
      })
      .refine(isSiretValid, {
        message: notificationMessages['invalid_siret'].description,
      })
      .transform(val => val.replace(/\s/g, '')),
  }),
});

export const getOrganizationInfoController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedRequest = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    const siret = parsedRequest.query.siret;
    const organizationInfo = await getOrganizationInfo(siret);

    if (isEmpty(organizationInfo)) {
      return next(new createError.NotFound());
    }

    return res.json({ organizationInfo });
  } catch (e) {
    if (e instanceof ZodError) {
      return next(
        new createError.BadRequest(
          e.errors.map(({ message }) => message).join(' ')
        )
      );
    }

    next(e);
  }
};
