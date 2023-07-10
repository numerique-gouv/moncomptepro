INSERT INTO users
  (id, email, email_verified, email_verified_at, encrypted_password, created_at, updated_at, given_name, family_name,
   phone_number, job)
VALUES
  (1, '233fd508-224d-4fe7-88ed-0a0d1df10e07@mailslurp.com', true, CURRENT_TIMESTAMP, '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'Nouveau', '0123456789', 'Sbire'),
  (2, '34c5063f-81c0-4d09-9d0b-a7502f844cdf@mailslurp.com', true, CURRENT_TIMESTAMP, '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'Sponsor1', '0123456789', 'Sbire'),
  (3, 'ba97e7a6-e603-465e-b2a5-236489ee0bb2@mailslurp.com', true, CURRENT_TIMESTAMP, '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'Sponsor2', '0123456789', 'Sbire'),
  (4, 'be040966-0142-421b-8041-5a3543a79a8a@mailslurp.com', true, CURRENT_TIMESTAMP, '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'External1', '0123456789', 'Sbire'),
  (5, '487ef426-6135-42c9-b805-9161d3474974@mailslurp.com', true, CURRENT_TIMESTAMP, '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'NotAuthenticated1', '0123456789', 'Sbire');

INSERT INTO organizations
  (id, siret, verified_email_domains, authorized_email_domains, created_at, updated_at)
VALUES
  -- DIRECTION INTERMINISTERIELLE DU NUMERIQUE (DINUM)
  (1, '13002526500013', '{"mailslurp.com"}', '{"mailslurp.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO users_organizations
  (user_id, organization_id, is_external, verification_type, authentication_by_peers_type, has_been_greeted)
VALUES
  (2, 1, false, 'verified_email_domain', 'all_members_notified', true),
  (3, 1, false, 'verified_email_domain', 'all_members_notified', true),
  (4, 1, true, 'verified_email_domain', 'all_members_notified', true),
  (5, 1, false, 'verified_email_domain', null, false);
