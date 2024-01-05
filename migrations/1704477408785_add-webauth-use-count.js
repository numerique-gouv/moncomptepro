exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE authenticators
      ADD COLUMN usage_count integer DEFAULT 0 NOT NULL;
  `);

  await pgm.db.query(`
    UPDATE authenticators
    SET counter = 0;
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE authenticators
      DROP COLUMN usage_count;
  `);
};
