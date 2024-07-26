exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE email_domains
      ADD CONSTRAINT unique_organization_domain
        UNIQUE (organization_id, domain, verification_type);
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE email_domains
      DROP CONSTRAINT unique_organization_domain;
  `);
};
