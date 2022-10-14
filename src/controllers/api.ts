import createError from 'http-errors';
import { isEmpty } from 'lodash';
import { getOrganizationInfo } from '../connectors/api-sirene';
import notificationMessages from '../notification-messages';
import { isSiretValid } from '../services/security';
import { Request, Response, NextFunction } from 'express';

export const getOrganizationInfoController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!isSiretValid(req.query.siret)) {
      return next(
        new createError.BadRequest(
          notificationMessages['invalid_siret'].description
        )
      );
    }

    const siretNoSpaces = req.query.siret.replace(/\s/g, '');

    const organizationInfo = await getOrganizationInfo(siretNoSpaces);

    if (isEmpty(organizationInfo)) {
      return next(new createError.NotFound());
    }

    return res.json({ organizationInfo });
  } catch (e) {
    next(e);
  }
};
