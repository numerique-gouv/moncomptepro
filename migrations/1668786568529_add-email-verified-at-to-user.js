exports.shorthands = undefined;

exports.up = async pgm => {
  await pgm.db.query(`
ALTER TABLE users
ADD COLUMN email_verified_at timestamp with time zone;
`);
};

exports.down = async pgm => {
  await pgm.db.query(`
ALTER TABLE users
DROP COLUMN email_verified_at;
`);
};
