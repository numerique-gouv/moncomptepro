/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
ALTER TABLE users
DROP COLUMN has_been_greeted_for_first_organization_join`);

  await pgm.db.query(`
ALTER TABLE users_organizations
ADD COLUMN has_been_greeted boolean;
`);

  await pgm.db.query(`
UPDATE users_organizations
SET has_been_greeted = TRUE`);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
ALTER TABLE users
ADD COLUMN has_been_greeted_for_first_organization_join boolean DEFAULT FALSE`);

  await pgm.db.query(`
UPDATE users
SET has_been_greeted_for_first_organization_join = TRUE`);
};
