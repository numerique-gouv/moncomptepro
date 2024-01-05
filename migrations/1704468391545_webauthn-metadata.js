exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE authenticators
      ADD COLUMN display_name character varying,
      ADD COLUMN created_at   timestamp with time zone NOT NULL DEFAULT NOW(),
      ADD COLUMN last_used_at timestamp with time zone;
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE authenticators
      DROP COLUMN display_name,
      DROP COLUMN created_at,
      DROP COLUMN last_used_at;
  `);
};
