import { QueryResult } from "pg";
import { getDatabaseConnection } from "../../connectors/postgres";

export const findById = async (id: number) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<Organization> = await connection.query(
    `
SELECT *
FROM organizations
WHERE id = $1`,
    [id],
  );

  return rows.shift();
};
export const findByUserId = async (user_id: number) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<Organization & BaseUserOrganizationLink> =
    await connection.query(
      `
SELECT
    o.*,
    uo.is_external,
    uo.verification_type,
    uo.has_been_greeted,
    uo.needs_official_contact_email_verification,
    uo.official_contact_email_verification_token,
    uo.official_contact_email_verification_sent_at
FROM organizations o
INNER JOIN users_organizations uo ON uo.organization_id = o.id
WHERE uo.user_id = $1
ORDER BY uo.created_at`,
      [user_id],
    );

  return rows;
};
export const findPendingByUserId = async (user_id: number) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<Organization & { moderation_id: number }> =
    await connection.query(
      `
SELECT o.*, m.id as moderation_id
FROM moderations m
INNER JOIN organizations o on o.id = m.organization_id
WHERE m.user_id = $1
AND m.type = 'organization_join_block'
AND m.moderated_at IS NULL
ORDER BY m.created_at
`,
      [user_id],
    );

  return rows;
};
export const findByVerifiedEmailDomain = async (email_domain: string) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<Organization> = await connection.query(
    `
SELECT o.*
FROM organizations o
FULL OUTER JOIN (
  SELECT
    uo.organization_id as id, count(*) as member_count
  FROM users_organizations uo
  GROUP BY uo.organization_id
) org_with_count on org_with_count.id = o.id
WHERE cached_est_active = 'true'
  AND (
    $1 = ANY (SELECT domain FROM email_domains WHERE organization_id = o.id AND verification_type = 'verified')
      OR $1 = ANY (SELECT domain FROM email_domains WHERE organization_id = o.id AND verification_type = 'trackdechets_postal_mail')
    )
ORDER BY member_count desc NULLS LAST;`,
    [email_domain],
  );

  return rows;
};

export const getUsersByOrganization = async (
  organization_id: number,
  additionalWhereClause: string = "",
  additionalParams: any[] = [],
) => {
  const connection = getDatabaseConnection();
  const baseParams = [organization_id];

  const { rows }: QueryResult<User & BaseUserOrganizationLink> =
    await connection.query(
      `
SELECT
    u.*,
    uo.is_external,
    uo.verification_type,
    uo.has_been_greeted,
    uo.needs_official_contact_email_verification,
    uo.official_contact_email_verification_token,
    uo.official_contact_email_verification_sent_at
FROM users u
INNER JOIN users_organizations AS uo ON uo.user_id = u.id
WHERE uo.organization_id = $1
${additionalWhereClause}`,
      [...baseParams, ...additionalParams],
    );

  return rows;
};

export const getUsers = (organization_id: number) =>
  getUsersByOrganization(organization_id);

export const getUserOrganizationLink = async (
  organization_id: number,
  user_id: number,
) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<UserOrganizationLink> = await connection.query(
    `
SELECT
  user_id,
  organization_id,
  is_external,
  created_at,
  updated_at,
  verification_type,
  has_been_greeted,
  needs_official_contact_email_verification,
  official_contact_email_verification_token,
  official_contact_email_verification_sent_at
FROM users_organizations
WHERE organization_id = $1 AND user_id = $2`,
    [organization_id, user_id],
  );

  return rows.shift();
};
