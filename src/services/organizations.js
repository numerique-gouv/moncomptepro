import { getDatabaseConnection } from '../connectors/postgres';

export const findByUserId = async user_id => {
  const connection = getDatabaseConnection();

  const { rows: results } = await connection.query(
    `
SELECT id, siret FROM organizations
INNER JOIN users_organizations ON users_organizations.organization_id = organizations.id
WHERE users_organizations.user_id = $1`,
    [user_id]
  );

  return results;
};

export const findBySiret = async siret => {
  const connection = getDatabaseConnection();

  const {
    rows: [result],
  } = await connection.query(`SELECT * FROM organizations WHERE siret = $1`, [
    siret,
  ]);

  return result;
};

export const insert = async ({ siret, user_id }) => {
  const connection = getDatabaseConnection();

  try {
    await connection.query('BEGIN');

    const {
      rows: [organization],
    } = await connection.query(
      `INSERT INTO organizations (siret) VALUES ($1) RETURNING id`,
      [siret]
    );

    await connection.query(
      `INSERT INTO users_organizations (user_id, organization_id) VALUES ($1, $2)`,
      [user_id, organization.id]
    );

    await connection.query('COMMIT');

    return organization;
  } catch (e) {
    await connection.query('ROLLBACK');
    throw e;
  }
};
