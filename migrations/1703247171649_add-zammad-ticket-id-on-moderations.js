//

exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
      ALTER TABLE moderations
          ADD COLUMN ticket_id int;
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
      ALTER TABLE moderations
          DROP COLUMN ticket_id;
  `);
};
