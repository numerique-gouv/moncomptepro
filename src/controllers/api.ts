import { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { z, ZodError } from "zod";
import {
  InseeConnectionError,
  InseeNotFoundError,
  NotFoundError,
} from "../config/errors";
import notificationMessages from "../config/notification-messages";
import { getOrganizationInfo } from "../connectors/api-sirene";
import { sendModerationProcessedEmail } from "../managers/moderation";
import { notifyAllMembers } from "../managers/organization/authentication-by-peers";
import { forceJoinOrganization } from "../managers/organization/join";
import { markDomainAsVerified } from "../managers/organization/main";
import { getUserOrganizationLink } from "../repositories/organization/getters";
import {
  idSchema,
  optionalBooleanSchema,
  siretSchema,
} from "../services/custom-zod-schemas";
import { logger } from "../services/log";

export const getPingApiSireneController = async (
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  try {
    await getOrganizationInfo("13002526500013"); // we use DINUM siret for the ping route

    return res.json({});
  } catch (e) {
    logger.error(e);
    return res.status(502).json({ message: "Bad Gateway" });
  }
};

export const getOrganizationInfoController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      siret: siretSchema(),
    });

    const { siret } = await schema.parseAsync(req.params);

    const organizationInfo = await getOrganizationInfo(siret);

    return res.json({ organizationInfo });
  } catch (e) {
    if (e instanceof InseeNotFoundError) {
      return next(new HttpErrors.NotFound());
    }

    if (e instanceof ZodError) {
      return next(
        new HttpErrors.BadRequest(
          notificationMessages["invalid_siret"].description,
        ),
      );
    }

    if (e instanceof InseeConnectionError) {
      return next(
        new HttpErrors.GatewayTimeout(
          notificationMessages["insee_unexpected_error"].description,
        ),
      );
    }

    next(e);
  }
};

export const postForceJoinOrganizationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      organization_id: idSchema(),
      user_id: idSchema(),
      is_external: optionalBooleanSchema(),
    });

    const { organization_id, user_id, is_external } = await schema.parseAsync(
      req.query,
    );

    let userOrganizationLink = await getUserOrganizationLink(
      organization_id,
      user_id,
    );
    if (!userOrganizationLink) {
      userOrganizationLink = await forceJoinOrganization({
        organization_id,
        user_id,
        is_external,
      });
    }

    if (!userOrganizationLink.authentication_by_peers_type) {
      await notifyAllMembers({ user_id, organization_id });
    }

    return res.json({});
  } catch (e) {
    logger.error(e);
    if (e instanceof ZodError) {
      return next(new HttpErrors.BadRequest());
    }

    next(e);
  }
};

export const postSendModerationProcessedEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      organization_id: idSchema(),
      user_id: idSchema(),
    });

    const { organization_id, user_id } = await schema.parseAsync(req.query);

    await sendModerationProcessedEmail({ organization_id, user_id });

    return res.json({});
  } catch (e) {
    logger.error(e);
    if (e instanceof ZodError) {
      return next(new HttpErrors.BadRequest());
    }

    if (e instanceof NotFoundError) {
      return next(new HttpErrors.NotFound());
    }

    next(e);
  }
};

export const postMarkDomainAsVerified = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      organization_id: idSchema(),
      domain: z.string().trim().min(1),
    });

    const { organization_id, domain } = await schema.parseAsync(req.query);

    await markDomainAsVerified({
      organization_id,
      domain,
      domain_verification_type: "verified",
    });

    return res.json({});
  } catch (e) {
    logger.error(e);
    if (e instanceof ZodError) {
      return next(new HttpErrors.BadRequest());
    }

    next(e);
  }
};
