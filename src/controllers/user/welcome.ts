import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { idSchema } from '../../services/custom-zod-schemas';

export const getWelcomeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = z.object({
      params: z.object({
        id: idSchema(),
      }),
    });

    const {
      params: { id: organization_id },
    } = await schema.parseAsync({
      params: req.params,
    });

    return res.render('user/welcome', {
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    next(error);
  }
};
