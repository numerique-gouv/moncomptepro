INSERT INTO users
  (id, email, email_verified, email_verified_at, encrypted_password, created_at, updated_at, given_name, family_name,
   phone_number, job)
VALUES
  (1, '435f6a4d-df7d-4840-be7b-bc4851b64e91@mailslurp.com', true, CURRENT_TIMESTAMP, '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'User1', '0123456789', 'Sbire'),
  (2, '76450610-4dcc-4664-b9ab-1cea869b62b1@mailslurp.com', true, CURRENT_TIMESTAMP, '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'User2', '0123456789', 'Sbire');


INSERT INTO organizations
  (id, siret, verified_email_domains, authorized_email_domains, created_at, updated_at)
VALUES
  -- COMMUNE DE CLAMART - Mairie
  (1, '21920023500014', '{}', '{}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- user are already in an organization to skip organization suggestion
INSERT INTO users_organizations
  (user_id, organization_id, verification_type, authentication_by_peers_type, has_been_greeted)
VALUES
  (1, 1, 'verified_email_domain', 'all_members_notified', true),
  (2, 1, 'verified_email_domain', 'all_members_notified', true);
