import { QueryResult } from "pg";
import { getDatabaseConnection } from "../connectors/postgres";
import { hashToPostgresParams } from "../services/hash-to-postgres-params";

export const findById = async (id: number) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<User> = await connection.query(
    `
SELECT *
FROM users WHERE id = $1
`,
    [id],
  );

  return rows.shift();
};

export const findByEmail = async (email: string) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<User> = await connection.query(
    `
SELECT *
FROM users WHERE email = $1
`,
    [email],
  );

  return rows.shift();
};

export const findByMagicLinkToken = async (magic_link_token: string) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<User> = await connection.query(
    `
SELECT *
FROM users WHERE magic_link_token = $1
`,
    [magic_link_token],
  );

  return rows.shift();
};

export const findByResetPasswordToken = async (
  reset_password_token: string,
) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<User> = await connection.query(
    `
SELECT *
FROM users WHERE reset_password_token = $1
`,
    [reset_password_token],
  );

  return rows.shift();
};

export const update = async (id: number, fieldsToUpdate: Partial<User>) => {
  const connection = getDatabaseConnection();

  const fieldsToUpdateWithTimestamps = {
    ...fieldsToUpdate,
    updated_at: new Date(),
  };

  const { paramsString, valuesString, values } = hashToPostgresParams<User>(
    fieldsToUpdateWithTimestamps,
  );

  const { rows }: QueryResult<User> = await connection.query(
    `UPDATE users SET ${paramsString} = ${valuesString} WHERE id = $${
      values.length + 1
    } RETURNING *`,
    [...values, id],
  );

  return rows.shift()!;
};

export const create = async ({
  email,
  encrypted_password = null,
}: {
  email: string;
  encrypted_password?: string | null;
}) => {
  const connection = getDatabaseConnection();

  const userWithTimestamps = {
    email,
    email_verified: false,
    verify_email_token: null,
    verify_email_sent_at: null,
    encrypted_password,
    magic_link_token: null,
    magic_link_sent_at: null,
    reset_password_token: null,
    reset_password_sent_at: null,
    sign_in_count: 0,
    last_sign_in_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const { paramsString, valuesString, values } =
    hashToPostgresParams<User>(userWithTimestamps);

  const { rows }: QueryResult<User> = await connection.query(
    `INSERT INTO users ${paramsString} VALUES ${valuesString} RETURNING *;`,
    values,
  );

  return rows.shift()!;
};

export const deleteUser = async (id: number) => {
  const connection = getDatabaseConnection();

  const { rowCount } = await connection.query(
    `
        DELETE FROM users
        WHERE id = $1
        RETURNING *`,
    [id],
  );

  return rowCount > 0;
};
