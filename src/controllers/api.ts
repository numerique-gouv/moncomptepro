import createError from 'http-errors';
import { isEmpty } from 'lodash';
import { getOrganizationInfo } from '../connectors/api-sirene';
import notificationMessages from '../notification-messages';
import { isSiretValid } from '../services/security';
import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const getOrganizationInfoController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z.object({
      query: z.object({
        siret: z
          .string()
          .refine(isSiretValid)
          .transform(val => val.replace(/\s/g, '')),
      }),
    });

    const parsedRequest = await schema.parseAsync({
      query: req.query,
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
          notificationMessages['invalid_siret'].description
        )
      );
    }

    next(e);
  }
};
