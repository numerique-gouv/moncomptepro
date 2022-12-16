import { getDatabaseConnection } from '../connectors/postgres';

export const upsertAndIncrementCount = async (
  user_id: number,
  oidc_client_id: number
) => {
  const connection = getDatabaseConnection();

  const {
    rows: [result],
  } = await connection.query(
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
