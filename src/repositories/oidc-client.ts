import { getDatabaseConnection } from '../connectors/postgres';

export const getClients = async () => {
  const connection = getDatabaseConnection();

  const { rows: results } = await connection.query(
    'SELECT client_id, client_secret, redirect_uris, post_logout_redirect_uris, scope FROM oidc_clients'
  );

  return results;
};

export const findByClientId = async (client_id: string) => {
  const connection = getDatabaseConnection();

  const {
    rows: [results],
  } = await connection.query(
    `
SELECT id, client_id, client_secret, redirect_uris, post_logout_redirect_uris, scope
FROM oidc_clients
WHERE client_id = $1
`,
    [client_id]
  );

  return results;
};
