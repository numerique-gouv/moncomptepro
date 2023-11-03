import { getDatabaseConnection } from '../connectors/postgres';
import { QueryResult } from 'pg';

export const createModeration = async ({
  user_id,
  organization_id,
  type,
  origin,
}: BaseModeration) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<Moderation> = await connection.query(
    `
INSERT INTO moderations (user_id, organization_id, type, origin)
VALUES ($1, $2, $3, $4)
RETURNING *;`,
    [user_id, organization_id, type, origin]
  );

  return rows.shift()!;
};

export const findPendingModeration = async ({
  user_id,
  organization_id,
  type,
}: {
  user_id: number;
  organization_id: number;
  type: Moderation['type'];
}) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<Moderation> = await connection.query(
    `
SELECT *
FROM moderations
WHERE user_id = $1
  AND organization_id = $2
  AND type = $3
  AND moderated_at IS NULL;`,
    [user_id, organization_id, type]
  );

  return rows.shift();
};
