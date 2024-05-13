exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE users
      ADD COLUMN needs_inclusionconnect_welcome_page boolean DEFAULT FALSE NOT NULL;
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE users
      DROP COLUMN needs_inclusionconnect_welcome_page;
  `);
};
