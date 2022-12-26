import { getDatabaseConnection } from '../connectors/postgres';
import { QueryResult } from 'pg';

const createModeration = async ({
  user_id,
  organization_id,
  type,
  as_external,
}: {
  user_id: number;
  organization_id: number;
  type: string;
  as_external: boolean;
}) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<Moderation> = await connection.query(
    `
INSERT INTO moderations (user_id, organization_id, type, as_external)
VALUES ($1, $2, $3, $4)
RETURNING *;`,
    [user_id, organization_id, type, as_external]
  );

  return rows.shift()!;
};

export const createOrganizationJoinBlockModeration = async ({
  user_id,
  organization_id,
  as_external,
}: {
  user_id: number;
  organization_id: number;
  as_external: boolean;
}) =>
  await createModeration({
    user_id,
    organization_id,
    type: 'organization_join_block',
    as_external,
  });

export const createBigOrganizationJoinModeration = async ({
  user_id,
  organization_id,
  as_external,
}: {
  user_id: number;
  organization_id: number;
  as_external: boolean;
}) =>
  await createModeration({
    user_id,
    organization_id,
    type: 'big_organization_join',
    as_external,
  });
