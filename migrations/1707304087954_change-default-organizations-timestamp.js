exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE "organizations" ALTER COLUMN "created_at" SET DEFAULT now();
    ALTER TABLE "organizations" ALTER COLUMN "updated_at" SET DEFAULT now();
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
  ALTER TABLE "organizations" ALTER COLUMN "created_at" SET DEFAULT '1970-01-01 00:00:00'::timestamp without time zone;
  ALTER TABLE "organizations" ALTER COLUMN "updated_at" SET DEFAULT '1970-01-01 00:00:00'::timestamp without time zone;
  `);
};
