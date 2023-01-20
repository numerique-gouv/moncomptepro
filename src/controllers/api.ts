import { BadRequest, GatewayTimeout, NotFound } from 'http-errors';
import { isEmpty } from 'lodash';
import { getOrganizationInfo } from '../connectors/api-sirene';
import notificationMessages from '../notification-messages';
import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { siretSchema } from '../services/custom-zod-schemas';
import { InseeTimeoutError } from '../errors';

export const getOrganizationInfoController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z.object({
      query: z.object({
        siret: siretSchema(),
      }),
    });

    const {
      query: { siret },
    } = await schema.parseAsync({
      query: req.query,
    });

    const organizationInfo = await getOrganizationInfo(siret);

    if (isEmpty(organizationInfo)) {
      return next(new NotFound());
    }

    return res.json({ organizationInfo });
  } catch (e) {
    if (e instanceof ZodError) {
      return next(
        new BadRequest(notificationMessages['invalid_siret'].description)
      );
    }

    if (e instanceof InseeTimeoutError) {
      return next(
        new GatewayTimeout(notificationMessages['insee_timeout'].description)
      );
    }

    next(e);
  }
};
