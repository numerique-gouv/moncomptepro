import { getDatabaseConnection } from '../connectors/postgres';
import { QueryResult } from 'pg';

// properties of OidcClients are defined here: https://openid.net/specs/openid-connect-registration-1_0.html#ClientMetadata
export type OidcClient = {
  id: number;
  name: string;
  client_id: string;
  client_secret: string;
  redirect_uris: string[];
  created_at: Date;
  updated_at: Date;
  post_logout_redirect_uris: string[];
  scope: string;
};

export const getClients = async (): Promise<OidcClient[]> => {
  const connection = getDatabaseConnection();

  const { rows: results }: QueryResult<OidcClient> = await connection.query(`
SELECT
    id,
    name,
    client_id,
    client_secret,
    redirect_uris,
    created_at,
    updated_at,
    post_logout_redirect_uris,
    scope
FROM oidc_clients
`);

  return results;
};

export const findByClientId = async (
  client_id: string
): Promise<OidcClient | undefined> => {
  const connection = getDatabaseConnection();

  const {
    rows: [results],
  }: QueryResult<OidcClient> = await connection.query(
    `
SELECT id, client_id, client_secret, redirect_uris, post_logout_redirect_uris, scope
FROM oidc_clients
WHERE client_id = $1
`,
    [client_id]
  );

  return results;
};
