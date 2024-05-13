exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE users
      DROP COLUMN legacy_user;
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE users
      ADD COLUMN legacy_user boolean DEFAULT FALSE;
  `);
};
