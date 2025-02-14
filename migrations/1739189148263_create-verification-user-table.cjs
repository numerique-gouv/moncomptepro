exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
  CREATE TABLE users_verification (
    user_id           INTEGER UNIQUE PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    verification_type VARCHAR(255),
    verified_at       TIMESTAMP WITH TIME ZONE,

    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query(`DROP TABLE users_verification;`);
};
