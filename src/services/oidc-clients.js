import { getDatabaseConnection } from '../connectors/postgres';

export const getClients = async () => {
  const connection = getDatabaseConnection();

  const {
    rows: results,
  } = await connection.query('SELECT client_id, client_secret, redirect_uris FROM oidc_clients');

  return results;
};
