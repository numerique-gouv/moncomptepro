import {
  findById as findOrganizationById,
  getUsers,
} from "../../repositories/organization/getters";
import { isEmpty } from "lodash-es";
import { NotFoundError } from "../../config/errors";
import {
  addAuthorizedDomain,
  addVerifiedDomain,
  updateUserOrganizationLink,
} from "../../repositories/organization/setters";
import { getEmailDomain } from "../../services/email";

export const markDomainAsVerified = async ({
  organization_id,
  domain,
  verification_type,
}: {
  organization_id: number;
  domain: string;
  verification_type: UserOrganizationLink["verification_type"];
}) => {
  const organization = await findOrganizationById(organization_id);
  if (isEmpty(organization)) {
    throw new NotFoundError();
  }

  const { siret, verified_email_domains, authorized_email_domains } =
    organization;

  if (!verified_email_domains.includes(domain)) {
    await addVerifiedDomain({ siret, domain });
  }

  if (!authorized_email_domains.includes(domain)) {
    await addAuthorizedDomain({ siret, domain });
  }

  const usersInOrganization = await getUsers(organization_id);

  await Promise.all(
    usersInOrganization.map(
      ({ id, email, verification_type: current_verification_type }) => {
        const userDomain = getEmailDomain(email);
        if (userDomain === domain && isEmpty(current_verification_type)) {
          return updateUserOrganizationLink(organization_id, id, {
            verification_type,
          });
        }

        return null;
      },
    ),
  );
};
