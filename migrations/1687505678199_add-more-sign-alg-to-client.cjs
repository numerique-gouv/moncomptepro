/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
ALTER TABLE oidc_clients
ADD COLUMN id_token_signed_response_alg character varying
`);
  await pgm.db.query(`
ALTER TABLE oidc_clients
ADD COLUMN authorization_signed_response_alg character varying
`);
  await pgm.db.query(`
ALTER TABLE oidc_clients
ADD COLUMN introspection_signed_response_alg character varying
`);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
ALTER TABLE oidc_clients
DROP COLUMN id_token_signed_response_alg
  `);
  await pgm.db.query(`
ALTER TABLE oidc_clients
DROP COLUMN authorization_signed_response_alg
`);
  await pgm.db.query(`
ALTER TABLE oidc_clients
DROP COLUMN introspection_signed_response_alg
`);
};
