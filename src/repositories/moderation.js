import { getDatabaseConnection } from '../connectors/postgres';

const createModeration = async ({
  user_id,
  organization_id,
  type,
  as_external,
}) => {
  const connection = getDatabaseConnection();

  await connection.query(
    `INSERT INTO moderations (user_id, organization_id, type, as_external) VALUES ($1, $2, $3, $4);`,
    [user_id, organization_id, type, as_external]
  );
};

export const createOrganizationJoinBlockModeration = async ({
  user_id,
  organization_id,
  as_external,
}) => {
  await createModeration({
    user_id,
    organization_id,
    type: 'organization_join_block',
    as_external,
  });
};

export const createBigOrganizationJoinModeration = async ({
  user_id,
  organization_id,
  as_external,
}) => {
  await createModeration({
    user_id,
    organization_id,
    type: 'big_organization_join',
    as_external,
  });
};
