exports.shorthands = undefined;

exports.up = async pgm => {
  await pgm.db.query(`
ALTER TABLE users
DROP COLUMN roles;
`);
};

exports.down = async pgm => {
  await pgm.db.query(`
ALTER TABLE users
ADD COLUMN roles character varying[] DEFAULT '{}'::character varying[];
`);
};
