import { getDatabaseConnection } from '../connectors/postgres';
import { QueryResult } from 'pg';

export const createModeration = async ({
  user_id,
  organization_id,
  type,
  as_external = false,
}: {
  user_id: number;
  organization_id: number;
  type: 'organization_join_block' | 'non_verified_domain';
  as_external?: boolean;
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
