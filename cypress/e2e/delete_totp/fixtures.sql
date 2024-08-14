INSERT INTO users
  (id, email, email_verified, email_verified_at, encrypted_password, created_at, updated_at,
   given_name, family_name, phone_number, job, encrypted_totp_key, totp_key_verified_at, force_2fa)
VALUES
  (1, 'eab4ab97-875d-4ec7-bdcc-04323948ee63@mailslurp.com', true, CURRENT_TIMESTAMP,
   '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
   'Jean', 'Jean', '0123456789', 'Sbire',
   'kuOSXGk68H2B3pYnph0uyXAHrmpbWaWyX/iX49xVaUc=.VMPBZSO+eAng7mjS.cI2kRY9rwhXchcKiiaMZIg==',
   CURRENT_TIMESTAMP, true
  ),
  (2, 'c9fabb94-9274-4ece-a3d0-54b1987c8588@mailslurp.com', true, CURRENT_TIMESTAMP,
   '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
   'Jean2', 'Jean2', '0123456789', 'Sbire',
   'kuOSXGk68H2B3pYnph0uyXAHrmpbWaWyX/iX49xVaUc=.VMPBZSO+eAng7mjS.cI2kRY9rwhXchcKiiaMZIg==',
   CURRENT_TIMESTAMP, true
  );

INSERT INTO organizations
  (id, siret, created_at, updated_at)
VALUES
  (1, '21340126800130', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO users_organizations
  (user_id, organization_id, is_external, verification_type, authentication_by_peers_type, has_been_greeted)
VALUES
  (1, 1, false, 'verified_email_domain', 'all_members_notified', true),
  (2, 1, false, 'verified_email_domain', 'all_members_notified', true);
