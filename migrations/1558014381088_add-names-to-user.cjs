exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
ALTER TABLE users
ADD COLUMN given_name character varying,
ADD COLUMN family_name character varying;
`);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
ALTER TABLE users
DROP COLUMN given_name,
DROP COLUMN family_name;
`);
};
