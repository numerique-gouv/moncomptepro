exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE organizations
      ADD COLUMN trackdechets_email_domains character varying[] DEFAULT '{}'::character varying[] NOT NULL;
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE organizations
      DROP COLUMN trackdechets_email_domains;
  `);
};
