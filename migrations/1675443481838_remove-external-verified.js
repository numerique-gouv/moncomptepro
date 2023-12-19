exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
ALTER TABLE organizations
DROP COLUMN external_verified_email_domains;
`);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
ALTER TABLE organizations
ADD COLUMN external_verified_email_domains character varying[] DEFAULT '{}'::character varying[];
  `);
};
