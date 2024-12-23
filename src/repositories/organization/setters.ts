import { upsertFactory } from "@gouvfr-lasuite/proconnect.identite/organization";
import type { User } from "@gouvfr-lasuite/proconnect.identite/types";
import type { QueryResult } from "pg";
import { getDatabaseConnection } from "../../connectors/postgres";
import { hashToPostgresParams } from "../../services/hash-to-postgres-params";

export const upsert = upsertFactory({ pg: getDatabaseConnection() });

export const linkUserToOrganization = async ({
  organization_id,
  user_id,
  is_external = false,
  verification_type,
  needs_official_contact_email_verification = false,
}: {
  organization_id: number;
  user_id: number;
  is_external?: boolean;
  verification_type: UserOrganizationLink["verification_type"];
  needs_official_contact_email_verification?: UserOrganizationLink["needs_official_contact_email_verification"];
}): Promise<UserOrganizationLink> => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<UserOrganizationLink> = await connection.query(
    `
INSERT INTO users_organizations
    (user_id,
     organization_id,
     is_external,
     verification_type,
     needs_official_contact_email_verification,
     updated_at,
     created_at)
VALUES
    ($1, $2, $3, $4, $5, $6, $7)
RETURNING *`,
    [
      user_id,
      organization_id,
      is_external,
      verification_type,
      needs_official_contact_email_verification,
      new Date(),
      new Date(),
    ],
  );

  return rows.shift()!;
};

export const updateUserOrganizationLink = async (
  organization_id: number,
  user_id: number,
  fieldsToUpdate: Partial<BaseUserOrganizationLink>,
) => {
  const connection = getDatabaseConnection();

  const fieldsToUpdateWithTimestamps = {
    ...fieldsToUpdate,
    updated_at: new Date(),
  };

  const { paramsString, valuesString, values } = hashToPostgresParams<User>(
    fieldsToUpdateWithTimestamps,
  );

  const { rows }: QueryResult<UserOrganizationLink> = await connection.query(
    `
UPDATE users_organizations SET ${paramsString} = ${valuesString}
WHERE organization_id = $${values.length + 1}
AND user_id = $${values.length + 2} RETURNING *`,
    [...values, organization_id, user_id],
  );

  return rows.shift()!;
};

export const deleteUserOrganization = async ({
  user_id,
  organization_id,
}: {
  user_id: number;
  organization_id: number;
}) => {
  const connection = getDatabaseConnection();

  const { rowCount } = await connection.query(
    `
DELETE FROM users_organizations
WHERE user_id = $1 AND organization_id = $2`,
    [user_id, organization_id],
  );

  return rowCount > 0;
};
