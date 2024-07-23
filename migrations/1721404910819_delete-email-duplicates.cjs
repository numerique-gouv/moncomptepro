exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
    DELETE FROM email_domains ed
    WHERE ed.verification_type = 'temporary'
      AND EXISTS (
      SELECT 1
      FROM email_domains ed_verified
      WHERE ed_verified.organization_id = ed.organization_id
        AND ed_verified.domain = ed.domain
        AND ed_verified.verification_type = 'verified'
    );
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
    INSERT INTO email_domains (organization_id, domain, verification_type, created_at, updated_at)
    SELECT organization_id, domain, 'temporary', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    FROM email_domains
    WHERE verification_type = 'verified';
  `);
};
