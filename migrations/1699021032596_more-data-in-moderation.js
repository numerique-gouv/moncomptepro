/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
      ALTER TABLE moderations
          ADD COLUMN origin character varying;
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
      ALTER TABLE moderations
          DROP COLUMN origin;
  `);
};
