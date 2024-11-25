exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
    UPDATE users
    SET
      email = regexp_replace(email, '\\.prestataire@anct\\.gouv\\.fr$', '@ext.anct.gouv.fr'),
      email_verified = FALSE
    WHERE email LIKE '%.prestataire@anct.gouv.fr';
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
    UPDATE users
    SET
      email = regexp_replace(email, '@ext.anct.gouv.fr$', '.prestataire@anct.gouv.fr')
    WHERE email LIKE '%@ext.anct.gouv.fr';
  `);
};
