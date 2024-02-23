import { NotFoundError } from "../config/errors";
import { sendMail } from "../connectors/brevo";
import { findById as findOrganizationById } from "../repositories/organization/getters";
import { findById as findUserById } from "../repositories/user";

export const sendModerationProcessedEmail = async ({
  organization_id,
  user_id,
}: {
  organization_id: number;
  user_id: number;
}): Promise<{ emailSent: boolean }> => {
  const user = await findUserById(user_id);

  if (!user) {
    throw new NotFoundError();
  }

  const { email } = user;

  const organization = await findOrganizationById(organization_id);

  if (!organization) {
    throw new NotFoundError();
  }

  const { cached_libelle, siret } = organization;

  await sendMail({
    to: [email],
    subject: `[MonComptePro] Demande pour rejoindre ${cached_libelle || siret}`,
    template: "moderation-processed",
    params: {
      libelle: cached_libelle || siret,
    },
  });

  return { emailSent: true };
};
