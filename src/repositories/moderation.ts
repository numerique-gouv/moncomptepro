import { getDatabaseConnection } from '../connectors/postgres';
import { QueryResult } from 'pg';

export const createModeration = async ({
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
INSERT INTO moderations (user_id, organization_id, type)
VALUES ($1, $2, $3)
RETURNING *;`,
    [user_id, organization_id, type]
  );

  return rows.shift()!;
};
