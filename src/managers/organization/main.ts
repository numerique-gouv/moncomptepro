import {
  findById as findOrganizationById,
  findByUserId,
  findPendingByUserId,
  getUsers,
} from "../../repositories/organization/getters";
import { isEmpty } from "lodash";
import { NotFoundError } from "../../config/errors";
import {
  addAuthorizedDomain,
  addVerifiedDomain,
  deleteUserOrganization,
  updateUserOrganizationLink,
} from "../../repositories/organization/setters";
import { getEmailDomain } from "../../services/uses-a-free-email-provider";
import { setSelectedOrganizationId } from "../../repositories/redis/selected-organization";

export const getOrganizationsByUserId = findByUserId;
export const getOrganizationById = findOrganizationById;
export const getUserOrganizations = async ({
  user_id,
}: {
  user_id: number;
}): Promise<{
  userOrganizations: Organization[];
  pendingUserOrganizations: Organization[];
}> => {
  const userOrganizations = await findByUserId(user_id);
  const pendingUserOrganizations = await findPendingByUserId(user_id);

  return { userOrganizations, pendingUserOrganizations };
};
export const quitOrganization = async ({
  user_id,
  organization_id,
}: {
  user_id: number;
  organization_id: number;
}) => {
  await deleteUserOrganization({ user_id, organization_id });

  return null;
};
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

export const selectOrganization = async ({
  user_id,
  organization_id,
}: {
  user_id: number;
  organization_id: number;
}) => {
  const userOrganizations = await getOrganizationsByUserId(user_id);
  const organization = userOrganizations.find(
    ({ id }) => id === organization_id,
  );

  if (isEmpty(organization)) {
    throw new NotFoundError();
  }

  await setSelectedOrganizationId(user_id, organization_id);
};
