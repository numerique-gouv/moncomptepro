exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
ALTER TABLE users_organizations
ADD COLUMN created_at timestamp with time zone NOT NULL DEFAULT timestamp 'epoch',
ADD COLUMN updated_at timestamp with time zone NOT NULL DEFAULT timestamp 'epoch';
`);
  await pgm.db.query(`
ALTER TABLE organizations
ADD COLUMN created_at timestamp with time zone NOT NULL DEFAULT timestamp 'epoch',
ADD COLUMN updated_at timestamp with time zone NOT NULL DEFAULT timestamp 'epoch';
`);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
ALTER TABLE users_organizations
DROP COLUMN created_at,
DROP COLUMN updated_at;
`);
  await pgm.db.query(`
ALTER TABLE organizations
DROP COLUMN created_at,
DROP COLUMN updated_at;
`);
};
