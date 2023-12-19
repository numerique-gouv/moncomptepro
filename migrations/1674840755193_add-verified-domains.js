exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
ALTER TABLE organizations
ADD COLUMN verified_email_domains character varying[] DEFAULT '{}'::character varying[];
`);

  await pgm.db.query(`
ALTER TABLE users_organizations
ADD COLUMN verification_type character varying;
`);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
ALTER TABLE organizations
DROP COLUMN verified_email_domains;
`);

  await pgm.db.query(`
ALTER TABLE users_organizations
DROP COLUMN verification_type;
`);
};
