import { isEmpty, some } from "lodash-es";
import { NotFoundError } from "../../config/errors";
import {
  addDomain,
  findEmailDomainsByOrganizationId,
} from "../../repositories/email-domain";
import {
  findByUserId,
  findById as findOrganizationById,
  findPendingByUserId,
  getUsers,
} from "../../repositories/organization/getters";
import {
  deleteUserOrganization,
  updateUserOrganizationLink,
} from "../../repositories/organization/setters";
import { setSelectedOrganizationId } from "../../repositories/redis/selected-organization";
import { getEmailDomain } from "../../services/email";

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
  const hasBeenRemoved = await deleteUserOrganization({
    user_id,
    organization_id,
  });

  if (!hasBeenRemoved) {
    throw new NotFoundError();
  }

  return true;
};
export const markDomainAsVerified = async ({
  organization_id,
  domain,
  domain_verification_type,
}: {
  organization_id: number;
  domain: string;
  domain_verification_type: EmailDomain["verification_type"];
}) => {
  const organization = await findOrganizationById(organization_id);
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
