exports.shorthands = undefined;

exports.up = async pgm => {
  await pgm.db.query(`
ALTER TABLE moderations
ALTER COLUMN created_at TYPE timestamp with time zone,
ALTER COLUMN moderated_at TYPE timestamp with time zone;
`);
};

exports.down = async pgm => {
  await pgm.db.query(`
ALTER TABLE moderations
ALTER COLUMN created_at TYPE timestamp without time zone,
ALTER COLUMN moderated_at TYPE timestamp without time zone;
`);
};
