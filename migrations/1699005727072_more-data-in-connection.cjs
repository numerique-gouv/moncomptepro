/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
      ALTER TABLE users_oidc_clients
          ADD COLUMN organization_id int REFERENCES organizations (id)
              ON UPDATE CASCADE ON DELETE SET NULL;
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
      ALTER TABLE users_oidc_clients
          DROP COLUMN organization_id;
  `);
};
