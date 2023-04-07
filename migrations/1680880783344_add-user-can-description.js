exports.shorthands = undefined;

exports.up = async pgm => {
  await pgm.db.query(`
    ALTER TABLE oidc_clients
    ADD COLUMN client_user_can_description character varying;
  `);
};

exports.down = async pgm => {
  await pgm.db.query(`
    ALTER TABLE oidc_clients
    DROP COLUMN client_user_can_description;
  `);
};
