import _ from 'lodash';
import { getDatabaseConnection } from '../connectors/postgres';

export const createOrganizationJoinBlock = async (
  user,
  organization,
  asExternal
) => {
  const connection = getDatabaseConnection();

  await connection.query(
    `INSERT INTO moderations (user_id, organization_id, type, as_external) VALUES ($1, $2, $3, $4);`,
    [user.id, organization.id, 'organization_join_block', asExternal]
  );
};
