exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
ALTER TABLE users_organizations
DROP COLUMN authentication_by_peers_type`);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
ALTER TABLE users_organizations
ADD COLUMN authentication_by_peers_type character varying;
`);

  await pgm.db.query(`
UPDATE users_organizations
SET authentication_by_peers_type = 'all_members_notified'`);
};
