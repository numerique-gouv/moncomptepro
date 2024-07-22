INSERT INTO users
  (id, email, email_verified, email_verified_at, encrypted_password, created_at, updated_at, given_name, family_name,
   phone_number, job)
VALUES
  (1, 'unused@fake.gouv.fr', true, CURRENT_TIMESTAMP, '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'Nouveau', '0123456789', 'Sbire'),
-- We need a second member in the organization to trigger the sponsorship feature.
  (2, 'membre@fake.gouv.fr', true, CURRENT_TIMESTAMP, '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'Membre', '0123456789', 'Sbire');

INSERT INTO organizations
  (id, siret, created_at, updated_at)
VALUES
  (1, '13002526500013', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO email_domains
  (id, organization_id, domain, type, verified_at)
VALUES
  (1, 1, 'fake.gouv.fr', 'trackdechets_postal_mail', CURRENT_TIMESTAMP);

INSERT INTO users_organizations
  (user_id, organization_id, is_external, verification_type, authentication_by_peers_type, has_been_greeted)
VALUES
  (2, 1, false, 'verified_email_domain', 'is_the_only_active_member', true);
