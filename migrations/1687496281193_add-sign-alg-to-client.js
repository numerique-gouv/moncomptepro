/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
ALTER TABLE oidc_clients
ADD COLUMN userinfo_signed_response_alg character varying 
`);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
ALTER TABLE oidc_clients
DROP COLUMN userinfo_signed_response_alg 
`);
};
