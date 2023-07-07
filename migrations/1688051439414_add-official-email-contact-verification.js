exports.up = async pgm => {
  await pgm.db.query(`
ALTER TABLE users_organizations
ADD COLUMN needs_official_contact_email_verification boolean NOT NULL DEFAULT FALSE,
ADD COLUMN official_contact_email_verification_token character varying,
ADD COLUMN official_contact_email_verification_sent_at timestamp with time zone;
`);
};

exports.down = async pgm => {
  await pgm.db.query(`
ALTER TABLE users_organizations
DROP COLUMN needs_official_contact_email_verification,
DROP COLUMN official_contact_email_verification_token,
DROP COLUMN official_contact_email_verification_sent_at;
`);
};
