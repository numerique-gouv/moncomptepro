import { getDatabaseConnection } from "../connectors/postgres";
import { QueryResult } from "pg";
import { hashToPostgresParams } from "../services/hash-to-postgres-params";

export const findEmailDomainsByOrganizationId = async (
  organization_id: number,
) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<EmailDomain> = await connection.query(
    `
        SELECT *
        FROM email_domains
        WHERE organization_id = $1`,
    [organization_id],
  );

  return rows;
};

export const addDomain = async ({
  organization_id,
  domain,
  verification_type,
}: {
  organization_id: number;
  domain: string;
  verification_type: EmailDomain["verification_type"];
}) => {
  const connection = getDatabaseConnection();

  const emailDomain = {
    organization_id,
    domain,
    verification_type,
    can_be_suggested: true,
    verified_at: verification_type === "temporary" ? null : new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  };

  const { paramsString, valuesString, values } =
    hashToPostgresParams<EmailDomain>(emailDomain);

  const { rows }: QueryResult<EmailDomain> = await connection.query(
    `INSERT INTO email_domains ${paramsString} VALUES ${valuesString} RETURNING *;`,
    values,
  );

  return rows.shift()!;
};
