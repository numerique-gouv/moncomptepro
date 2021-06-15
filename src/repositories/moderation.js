import _ from 'lodash';
import { getDatabaseConnection } from '../connectors/postgres';

export const createOrganizationJoinBlock = async (user, organization) => {
  const connection = getDatabaseConnection();

  await connection.query(
    `INSERT INTO moderations (user_id, organization_id, type) VALUES ($1, $2, $3);`,
    [user.id, organization.id, 'organization_join_block']
  );
};
