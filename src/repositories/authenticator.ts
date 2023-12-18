import { getDatabaseConnection } from '../connectors/postgres';
import { QueryResult } from 'pg';
import { Authenticator, BaseAuthenticator } from '../types/authenticator';
import { encodeBase64URL } from '../services/base64';

export const getByUserId = async (user_id: number) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<Authenticator> = await connection.query(
    `
        SELECT *
        FROM authenticators
        WHERE user_id = $1
    `,
    [user_id]
  );

  return rows;
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
             transports)
        VALUES
            ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;`,
    [
      user_id,
      encodeBase64URL(credential_id),
      credential_public_key,
      counter,
      credential_device_type,
      credential_backed_up,
      transports,
    ]
  );

  return rows.shift()!;
};
