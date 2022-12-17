import { getDatabaseConnection } from '../connectors/postgres';
import { QueryResult } from 'pg';

export type UserOidcClient = {
  user_id: number;
  oidc_client_id: number;
  connection_count: number;
  created_at: Date;
  updated_at: Date;
};

export const getByUserIdOrderedByCount = async (
  user_id: number
): Promise<UserOidcClient[]> => {
  const connection = getDatabaseConnection();

  const { rows: results }: QueryResult<UserOidcClient> = await connection.query(
    `
SELECT user_id, oidc_client_id, connection_count, created_at, updated_at
FROM users_oidc_clients
WHERE user_id = $1
ORDER BY connection_count
`,
    [user_id]
  );

  return results;
};

export const upsertAndIncrementCount = async (
  user_id: number,
  oidc_client_id: number
): Promise<UserOidcClient> => {
  const connection = getDatabaseConnection();

  const {
    rows: [result],
  }: QueryResult<UserOidcClient> = await connection.query(
    `
INSERT INTO users_oidc_clients
  (user_id, oidc_client_id, connection_count, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT ON CONSTRAINT users_oidc_clients_pkey
DO UPDATE
  SET (connection_count, updated_at)
    = (users_oidc_clients.connection_count + 1, $5)
RETURNING *;
`,
    [
      user_id,
      oidc_client_id,
      1,
      new Date().toISOString(),
      new Date().toISOString(),
    ]
  );

  return result;
};
