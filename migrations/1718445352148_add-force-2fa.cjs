exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE users
      ADD COLUMN force_2fa boolean DEFAULT FALSE NOT NULL;
  `);
  await pgm.db.query(`
    UPDATE users
    SET force_2fa = true
    WHERE users.encrypted_totp_key IS NOT NULL;
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE users
      DROP COLUMN force_2fa;
  `);
};
