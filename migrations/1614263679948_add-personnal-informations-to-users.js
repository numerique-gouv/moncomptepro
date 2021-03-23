exports.shorthands = undefined;

exports.up = async pgm => {
  await pgm.db.query(`
ALTER TABLE users
ADD COLUMN phone_number character varying,
ADD COLUMN job character varying;
`);
};

exports.down = async pgm => {
  await pgm.db.query(`
ALTER TABLE users
DROP COLUMN phone_number,
DROP COLUMN job;
`);
};
