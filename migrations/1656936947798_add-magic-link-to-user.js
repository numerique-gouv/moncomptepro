exports.shorthands = undefined;

exports.up = async pgm => {
  await pgm.db.query(`
ALTER TABLE users
ADD COLUMN magic_link_token character varying,
ADD COLUMN magic_link_sent_at timestamp with time zone;
`);

  await pgm.db.query(`
ALTER TABLE users
ALTER COLUMN encrypted_password
DROP NOT NULL;`);
};

exports.down = async pgm => {
  await pgm.db.query(`
ALTER TABLE users
DROP COLUMN magic_link_token,
DROP COLUMN magic_link_sent_at;
`);

  await pgm.db.query(`
ALTER TABLE users
ALTER COLUMN encrypted_password
SET NOT NULL;`);
};
