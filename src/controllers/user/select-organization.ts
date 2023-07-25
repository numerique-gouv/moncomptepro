import { NextFunction, Request, Response } from 'express';
import {
  getOrganizationsByUserId,
  selectOrganization,
} from '../../managers/organization/main';
import { z } from 'zod';
import { idSchema } from '../../services/custom-zod-schemas';

export const getSelectOrganizationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userOrganizations = await getOrganizationsByUserId(
    req.session.user!.id
  );

  return res.render('user/select-organization', {
    userOrganizations,
    csrfToken: req.csrfToken(),
  });
};

export const postSelectOrganizationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = z.object({
    body: z.object({
      organization_id: idSchema(),
    }),
  });
  const {
    body: { organization_id },
  } = await schema.parseAsync({
    body: req.body,
  });

  await selectOrganization({ user_id: req.session.user!.id, organization_id });

  return next();
};
