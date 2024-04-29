exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
ALTER TABLE users_organizations
ADD COLUMN is_external boolean default FALSE;
`);

  await pgm.db.query(`
ALTER TABLE organizations
ADD COLUMN external_authorized_email_domains character varying[] DEFAULT '{}'::character varying[];
`);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
ALTER TABLE users_organizations
DROP COLUMN is_external;
`);

  await pgm.db.query(`
ALTER TABLE users_organizations
DROP COLUMN external_authorized_email_domains;
`);
};
