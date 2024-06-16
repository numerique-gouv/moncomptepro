exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE authenticators
      ADD COLUMN user_verified boolean DEFAULT TRUE NOT NULL;
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE authenticators
      DROP COLUMN user_verified;
  `);
};
