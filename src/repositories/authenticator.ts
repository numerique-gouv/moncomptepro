import { getDatabaseConnection } from '../connectors/postgres';
import { QueryResult } from 'pg';

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
