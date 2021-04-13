exports.shorthands = undefined;

exports.up = async pgm => {
  await pgm.db.query(`
ALTER TABLE oidc_clients
ADD COLUMN scope character varying DEFAULT 'openid email';
`);
};

exports.down = async pgm => {
  await pgm.db.query(`
ALTER TABLE oidc_clients
DROP COLUMN scope;
`);
};
