INSERT INTO users
  (id, email, email_verified, email_verified_at, encrypted_password, created_at, updated_at, given_name, family_name,
   phone_number, job)
VALUES
  (1, 'c6c64542-5601-43e0-b320-b20da72f6edc@mailslurp.com', true, CURRENT_TIMESTAMP, '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'Nouveau', '0123456789', 'Sbire'),
  (2, '761a72f6-d051-4df5-a733-62e207c4989b@mailslurp.com', true, CURRENT_TIMESTAMP, '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'User2', '0123456789', 'Sbire'),
  (3, 'be040966-0142-421b-8041-5a3543a79a8a@mailslurp.com', true, CURRENT_TIMESTAMP, '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'User3', '0123456789', 'Sbire'),
  (4, '487ef426-6135-42c9-b805-9161d3474974@mailslurp.com', true, CURRENT_TIMESTAMP, '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'User4', '0123456789', 'Sbire'),
  (5, '4fd3acbc-8711-4487-9313-c52dee8afcbb@mailslurp.com', true, CURRENT_TIMESTAMP, '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'User5', '0123456789', 'Sbire');

INSERT INTO organizations
  (id, siret, created_at, updated_at)
VALUES
  -- COMMUNE DE CLAMART - Mairie
  (1, '21920023500014', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  -- COMMUNE DE CLAMART - Service assainissement
  (2, '21920023500394', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, '45334017600024', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO email_domains
(organization_id, domain, verification_type, verified_at)
VALUES
  (1, 'mailslurp.com', 'verified', CURRENT_TIMESTAMP),
  (2, 'mailslurp.com', 'verified', CURRENT_TIMESTAMP),
  (3, 'randomain.fr', 'verified', CURRENT_TIMESTAMP);

INSERT INTO users_organizations
  (user_id, organization_id, is_external, verification_type, has_been_greeted)
VALUES
  (2, 1, false, 'domain', true),
  (3, 1, false, 'domain', true),
  (4, 1, false, 'domain', true),
  (5, 1, false, 'domain', true);
