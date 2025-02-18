import { markDomainAsVerifiedFactory } from "@gouvfr-lasuite/proconnect.identite/managers/organization";
import type { Organization } from "@gouvfr-lasuite/proconnect.identite/types";
import { isEmpty } from "lodash-es";
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

export const markDomainAsVerified = markDomainAsVerifiedFactory({
  addDomain,
  findEmailDomainsByOrganizationId,
  findOrganizationById,
  getUsers,
  updateUserOrganizationLink,
});

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
