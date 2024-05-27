exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE users
      ADD COLUMN encrypted_totp_key   character varying,
      ADD COLUMN totp_key_verified_at timestamp with time zone;
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE users
      DROP COLUMN encrypted_totp_key,
      DROP COLUMN totp_key_verified_at;
  `);
};
