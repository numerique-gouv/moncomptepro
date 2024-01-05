import { getDatabaseConnection } from "../connectors/postgres";
import { QueryResult } from "pg";
import { Authenticator, BaseAuthenticator } from "../types/authenticator";
import { decodeBase64URL, encodeBase64URL } from "../services/base64";

export const getAuthenticatorsByUserId = async (user_id: number) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<Authenticator> = await connection.query(
    `
        SELECT *
        FROM authenticators
        WHERE user_id = $1
    `,
    [user_id],
  );

  return rows.map((auth) => ({
    ...auth,
    // @ts-ignore
    credential_id: decodeBase64URL(auth.credential_id),
  }));
};

export const findAuthenticator = async (
  user_id: number,
  credential_id: Uint8Array,
) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<Authenticator> = await connection.query(
    `
        SELECT *
        FROM authenticators
        WHERE user_id = $1
          and credential_id = $2
    `,
    [user_id, encodeBase64URL(credential_id)],
  );

  return rows
    .map((auth) => ({
      ...auth,
      // @ts-ignore
      credential_id: decodeBase64URL(auth.credential_id),
    }))
    .shift();
};

export const createAuthenticator = async ({
  user_id,
  authenticator: {
    credential_id,
    credential_public_key,
    counter,
    credential_device_type,
    credential_backed_up,
    transports,
    display_name,
    last_used_at,
  },
}: {
  user_id: number;
  authenticator: BaseAuthenticator;
}) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<Authenticator> = await connection.query(
    `
        INSERT INTO authenticators
            (user_id,
             credential_id,
             credential_public_key,
             counter,
             credential_device_type,
             credential_backed_up,
             transports,
             display_name,
             created_at,
             last_used_at)
        VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9)
        RETURNING *;`,
    [
      user_id,
      encodeBase64URL(credential_id),
      credential_public_key,
      counter,
      credential_device_type,
      credential_backed_up,
      transports,
      display_name,
      last_used_at,
    ],
  );

  return rows.shift()!;
};

export const updateAuthenticator = async (
  credential_id: Uint8Array,
  { counter, last_used_at }: Partial<BaseAuthenticator>,
) => {
  const connexion = getDatabaseConnection();

  const { rows }: QueryResult<Authenticator> = await connexion.query(
    `
        UPDATE authenticators
        SET counter = $2, last_used_at = $3
        WHERE credential_id = $1
        RETURNING *`,
    [encodeBase64URL(credential_id), counter, last_used_at],
  );

  return rows.shift()!;
};

export const deleteAuthenticator = async (
  user_id: number,
  credential_id: string,
) => {
  const connection = getDatabaseConnection();

  const { rowCount } = await connection.query(
    `
        DELETE FROM authenticators
        WHERE user_id = $1
          and credential_id = $2
        RETURNING *`,
    [user_id, credential_id],
  );

  return rowCount > 0;
};
