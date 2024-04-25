exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
ALTER TABLE moderations
ADD COLUMN as_external boolean NOT NULL;`);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
ALTER TABLE moderations
DROP COLUMN as_external;`);
};
