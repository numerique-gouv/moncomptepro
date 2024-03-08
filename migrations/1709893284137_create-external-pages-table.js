/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
    CREATE TABLE external_pages (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(255),
      title VARCHAR(255),
      body TEXT,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pgm.db.query(`
    ALTER TABLE external_pages
    ADD CONSTRAINT unique_slug UNIQUE (slug);
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
    DROP TABLE external_pages;
  `);
};
