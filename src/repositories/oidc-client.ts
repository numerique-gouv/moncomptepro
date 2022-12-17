import { getDatabaseConnection } from '../connectors/postgres';
import { QueryResult } from 'pg';

// properties of OidcClients are defined here: https://openid.net/specs/openid-connect-registration-1_0.html#ClientMetadata
// properties id, client_description, created_at, updated_at are non-standard properties
export type OidcClient = {
  id: number;
  client_description: string;
  created_at: Date;
  updated_at: Date;
  client_name: string;
  client_id: string;
  client_secret: string;
  redirect_uris: string[];
  post_logout_redirect_uris: string[];
  scope: string;
  client_uri: string;
};

export type UserOidcClient = {
  user_id: number;
  oidc_client_id: number;
  connection_count: number;
  created_at: Date;
  updated_at: Date;
};

export const getClients = async (): Promise<OidcClient[]> => {
  const connection = getDatabaseConnection();

  const { rows: results }: QueryResult<OidcClient> = await connection.query(`
SELECT
    id,
    client_description,
    created_at,
    updated_at,
    client_name,
    client_id,
    client_secret,
    redirect_uris,
    post_logout_redirect_uris,
    scope,
    client_uri
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
SELECT
    id,
    client_description,
    created_at,
    updated_at,
    client_name,
    client_id,
    client_secret,
    redirect_uris,
    post_logout_redirect_uris,
    scope,
    client_uri
FROM oidc_clients
WHERE client_id = $1
`,
    [client_id]
  );

  return results;
};

export const getByUserIdOrderedByConnectionCount = async (
  user_id: number
): Promise<OidcClient[]> => {
  const connection = getDatabaseConnection();

  const { rows: results }: QueryResult<OidcClient> = await connection.query(
    `
SELECT
    oc.id,
    oc.client_description,
    oc.created_at,
    oc.updated_at,
    oc.client_name,
    oc.client_id,
    oc.client_secret,
    oc.redirect_uris,
    oc.post_logout_redirect_uris,
    oc.scope,
    oc.client_uri
FROM users_oidc_clients uoc
INNER JOIN oidc_clients oc ON oc.id = uoc.oidc_client_id
WHERE user_id = $1
ORDER BY connection_count
`,
    [user_id]
  );

  return results;
};

export const upsertAndIncrementConnectionCount = async (
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
