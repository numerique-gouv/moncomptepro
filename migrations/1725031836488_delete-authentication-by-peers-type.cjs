exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
ALTER TABLE users_organizations
DROP COLUMN authentication_by_peers_type`);

  await pgm.db.query(`
ALTER TABLE users_organizations
DROP COLUMN sponsor_id
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
ALTER TABLE users_organizations
ADD COLUMN authentication_by_peers_type character varying;
`);

  await pgm.db.query(`
UPDATE users_organizations
SET authentication_by_peers_type = 'all_members_notified'`);

  await pgm.db.query(`
ALTER TABLE users_organizations
ADD COLUMN sponsor_id int REFERENCES users ON DELETE SET NULL
  `);
};
