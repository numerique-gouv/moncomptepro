exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
DROP INDEX index_users_on_verify_email_token;
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
CREATE UNIQUE INDEX index_users_on_verify_email_token ON users USING btree (verify_email_token);
  `);
};
