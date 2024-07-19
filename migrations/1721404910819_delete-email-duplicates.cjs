exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
    DELETE FROM email_domains ed
    WHERE ed.type = 'authorized'
      AND EXISTS (
      SELECT 1
      FROM email_domains ed_verified
      WHERE ed_verified.organization_id = ed.organization_id
        AND ed_verified.domain = ed.domain
        AND ed_verified.type = 'verified'
    );
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
    INSERT INTO email_domains (organization_id, domain, type, created_at, updated_at)
    SELECT organization_id, domain, 'authorized', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    FROM email_domains
    WHERE type = 'verified';
  `);
};
