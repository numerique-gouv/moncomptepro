import { isEmpty } from "lodash-es";
import { ForbiddenError, NotFoundError } from "../config/errors";
import { sendMail } from "../connectors/brevo";
import {
  deleteModeration,
  findModerationById,
} from "../repositories/moderation";
import { findById as findOrganizationById } from "../repositories/organization/getters";
import { findById as findUserById } from "../repositories/user";
import { send } from "../connectors/mail";
import { moderation_processed_mail } from "./user/email/moderation-processed";

export const sendModerationProcessedEmail = async ({
  organization_id,
  user_id,
}: {
  organization_id: number;
  user_id: number;
}): Promise<{ emailSent: boolean }> => {
  const user = await findUserById(user_id);

  if (isEmpty(user)) {
    throw new NotFoundError();
  }

  const { email } = user;

  const organization = await findOrganizationById(organization_id);

  if (isEmpty(organization)) {
    throw new NotFoundError();
  }

  const { cached_libelle, siret } = organization;

  await send({
    to: email,
    subject: `[MonComptePro] Demande pour rejoindre ${cached_libelle || siret}`,
    html: moderation_processed_mail({
      libelle: cached_libelle || siret,
    }).toString(),
  });

  return { emailSent: true };
};

export const getOrganizationFromModeration = async ({
  user,
  moderation_id,
}: {
  user: User;
  moderation_id: number;
}) => {
  const moderation = await findModerationById(moderation_id);

  if (isEmpty(moderation)) {
    throw new NotFoundError();
  }

  const organization = await findOrganizationById(moderation.organization_id);
  if (!organization) {
    throw new NotFoundError();
  }

  if (user.id !== moderation.user_id) {
    throw new ForbiddenError();
  }

  return organization;
};

export const cancelModeration = async ({
  user,
  moderation_id,
}: {
  user: User;
  moderation_id: number;
}) => {
  const moderation = await findModerationById(moderation_id);

  if (isEmpty(moderation)) {
    throw new NotFoundError();
  }

  if (user.id !== moderation.user_id) {
    throw new ForbiddenError();
  }

  return await deleteModeration(moderation_id);
};
