import type { User } from "@gouvfr-lasuite/proconnect.identite/types";
import {
  createUserFactory,
  findByEmailFactory,
  updateUserFactory,
} from "@gouvfr-lasuite/proconnect.identite/user";
import type { QueryResult } from "pg";
import { getDatabaseConnection } from "../connectors/postgres";
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

export const findByEmail = findByEmailFactory({ pg: getDatabaseConnection() });

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

export const update = updateUserFactory({ pg: getDatabaseConnection() });

export const create = createUserFactory({ pg: getDatabaseConnection() });

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
