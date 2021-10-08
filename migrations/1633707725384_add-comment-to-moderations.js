exports.shorthands = undefined;

exports.up = async pgm => {
  await pgm.db.query(`
ALTER TABLE moderations
ADD COLUMN comment character varying;
`);
};

exports.down = async pgm => {
  await pgm.db.query(`
ALTER TABLE moderations
DROP COLUMN comment;
`);
};
