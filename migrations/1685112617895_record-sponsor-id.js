/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = async pgm => {
  await pgm.db.query(`
ALTER TABLE users_organizations
ADD COLUMN sponsor_id int REFERENCES users ON DELETE SET NULL
  `);
};

exports.down = async pgm => {
  await pgm.db.query(`
ALTER TABLE users_organizations
DROP COLUMN sponsor_id
  `);
};
