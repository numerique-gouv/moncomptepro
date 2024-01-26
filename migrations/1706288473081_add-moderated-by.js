exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
ALTER TABLE moderations
ADD COLUMN moderated_by character varying;
`);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
ALTER TABLE moderations
DROP COLUMN moderated_by;
`);
};
