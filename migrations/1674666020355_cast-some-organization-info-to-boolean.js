exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
ALTER TABLE organizations ALTER cached_est_active TYPE boolean
USING CASE cached_est_active WHEN 'true' THEN true ELSE false END;
`);
  await pgm.db.query(`
ALTER TABLE organizations ALTER cached_est_diffusible TYPE boolean
USING CASE cached_est_diffusible WHEN 'true' THEN true ELSE false END;
`);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
ALTER TABLE organizations ALTER cached_est_active TYPE varchar
USING CASE cached_est_active WHEN true THEN 'true' ELSE 'false' END;`);
  await pgm.db.query(`
ALTER TABLE organizations ALTER cached_est_diffusible TYPE varchar
USING CASE cached_est_diffusible WHEN true THEN 'true' ELSE 'false' END;`);
};
