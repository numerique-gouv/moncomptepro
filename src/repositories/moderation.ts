import type { AppRouter } from '@betagouv/hyyypertool...trpc';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { QueryResult } from 'pg';
import { getDatabaseConnection } from '../connectors/postgres';
import { HYYYPERTOOL_URL } from '../env';

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: HYYYPERTOOL_URL || '',
    }),
  ],
});

export const createModeration = async ({
  user_id,
  organization_id,
  type,
}: {
  user_id: number;
  organization_id: number;
  type: Moderation['type'];
}) => {
  {
    const say = await trpc.hello.query('Raphael');
    console.log(say);
  }
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<Moderation> = await connection.query(
    `
INSERT INTO moderations (user_id, organization_id, type)
VALUES ($1, $2, $3)
RETURNING *;`,
    [user_id, organization_id, type]
  );

  return rows.shift()!;
};

export const findPendingModeration = async ({
  user_id,
  organization_id,
  type,
}: {
  user_id: number;
  organization_id: number;
  type: Moderation['type'];
}) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<Moderation> = await connection.query(
    `
SELECT *
FROM moderations
WHERE user_id = $1
  AND organization_id = $2
  AND type = $3
  AND moderated_at IS NULL;`,
    [user_id, organization_id, type]
  );

  return rows.shift();
};
