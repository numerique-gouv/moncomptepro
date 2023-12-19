import { findById as findUserById } from "../repositories/user";
import { sendMail } from "../connectors/sendinblue";

import { findById as findOrganizationById } from "../repositories/organization/getters";

export const sendModerationProcessedEmail = async ({
  organization_id,
  user_id,
}: {
  organization_id: number;
  user_id: number;
}): Promise<{ emailSent: boolean }> => {
  const { email } = (await findUserById(user_id))!;

  const { cached_libelle, siret } =
    (await findOrganizationById(organization_id))!;

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
