exports.shorthands = undefined;

exports.up = async pgm => {
  await pgm.db.query(`
ALTER TABLE oidc_clients
ADD COLUMN post_logout_redirect_uris character varying[] DEFAULT '{}'::character varying[];
`);
};

exports.down = async pgm => {
  await pgm.db.query(`
ALTER TABLE oidc_clients
DROP COLUMN post_logout_redirect_uris;
`);
};
