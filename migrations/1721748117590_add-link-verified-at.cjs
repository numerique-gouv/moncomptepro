exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE users_organizations
      ADD COLUMN verified_at timestamp with time zone;
  `);

  await pgm.db.query(`
  UPDATE users_organizations
  SET verified_at = updated_at
  WHERE verification_type IS NOT NULL;
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE users_organizations
      DROP COLUMN verified_at;
  `);
};
