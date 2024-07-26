import { isEmpty } from "lodash-es";
import { NotFoundError } from "../../config/errors";
import { setSelectedOrganizationId } from "../../repositories/redis/selected-organization";
import { getOrganizationsByUserId } from "./main";

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
