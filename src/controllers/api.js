import createError from 'http-errors';
import { isEmpty } from 'lodash';
import { getOrganizationInfo } from '../connectors/api-sirene';
import notificationMessages from '../notification-messages';
import { isSiretValid } from '../services/security';

export const getOrganizationInfoController = async (req, res, next) => {
  try {
    if (!isSiretValid(req.query.siret)) {
      return next(
        createError.BadRequest(
          notificationMessages['invalid_siret'].description
        )
      );
    }

    const siretNoSpaces = req.query.siret.replace(/\s/g, '');

    const organizationInfo = await getOrganizationInfo(siretNoSpaces);

    if (isEmpty(organizationInfo)) {
      return next(createError.NotFound());
    }

    return res.json({ organizationInfo });
  } catch (e) {
    next(e);
  }
};
