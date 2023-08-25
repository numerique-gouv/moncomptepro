import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { idSchema } from '../../services/custom-zod-schemas';

import { getSponsorLabel } from '../../managers/organization/authentication-by-peers';
import { getUserFromLoggedInSession } from '../../managers/session';
import { csrfToken } from '../../services/csrf-protection';

export const getWelcomeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z.object({
      params: z.object({
        organization_id: idSchema(),
      }),
    });

    const {
      params: { organization_id },
    } = await schema.parseAsync({
      params: req.params,
    });

    const sponsor_label = await getSponsorLabel({
      user_id: getUserFromLoggedInSession(req).id,
      organization_id,
    });

    return res.render('user/welcome', {
      csrfToken: csrfToken(req),
      sponsor_label,
    });
  } catch (error) {
    next(error);
  }
};
