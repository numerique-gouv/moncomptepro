import { isEmpty, some } from "lodash-es";
import { NotFoundError } from "../../config/errors";
import {
  addDomain,
  findEmailDomainsByOrganizationId,
} from "../../repositories/email-domain";
import { findById, getUsers } from "../../repositories/organization/getters";
import { updateUserOrganizationLink } from "../../repositories/organization/setters";
import { getEmailDomain } from "../../services/email";

//

export const markDomainAsVerified = async ({
  organization_id,
  domain,
  domain_verification_type,
}: {
  organization_id: number;
  domain: string;
  domain_verification_type: EmailDomain["verification_type"];
}) => {
  const organization = await findById(organization_id);
  if (isEmpty(organization)) {
    throw new NotFoundError();
  }
  const emailDomains = await findEmailDomainsByOrganizationId(organization_id);

  if (
    !some(emailDomains, { domain, verification_type: domain_verification_type })
  ) {
    await addDomain({
      organization_id,
      domain,
      verification_type: domain_verification_type,
    });
  }

  const usersInOrganization = await getUsers(organization_id);

  await Promise.all(
    usersInOrganization.map(
      ({ id, email, verification_type: link_verification_type }) => {
        const userDomain = getEmailDomain(email);
        if (
          userDomain === domain &&
          [
            null,
            "no_verification_means_available",
            "no_verification_means_for_entreprise_unipersonnelle",
          ].includes(link_verification_type)
        ) {
          return updateUserOrganizationLink(organization_id, id, {
            verification_type: "domain",
          });
        }

        return null;
      },
    ),
  );
};
