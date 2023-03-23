exports.shorthands = undefined;

exports.up = async pgm => {
  await pgm.db.query(`
    ALTER TABLE organizations
    ADD COLUMN cached_code_officiel_geographique character varying;
  `);
};

exports.down = async pgm => {
  await pgm.db.query(`
    ALTER TABLE organizations
    DROP COLUMN cached_code_officiel_geographique;
  `);
};
