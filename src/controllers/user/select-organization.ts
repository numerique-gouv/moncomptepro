import { NextFunction, Request, Response } from "express";
import {
  getOrganizationsByUserId,
  selectOrganization,
} from "../../managers/organization/main";
import { z } from "zod";
import { idSchema } from "../../services/custom-zod-schemas";
import { getUserFromLoggedInSession } from "../../managers/session";
import { csrfToken } from "../../middlewares/csrf-protection";

export const getSelectOrganizationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userOrganizations = await getOrganizationsByUserId(
      getUserFromLoggedInSession(req).id,
    );

    return res.render("user/select-organization", {
      userOrganizations,
      csrfToken: csrfToken(req),
    });
  } catch (error) {
    next(error);
  }
};

export const postSelectOrganizationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      organization_id: idSchema(),
    });
    const { organization_id } = await schema.parseAsync(req.body);

    await selectOrganization({
      user_id: getUserFromLoggedInSession(req).id,
      organization_id,
    });

    return next();
  } catch (error) {
    next(error);
  }
};
