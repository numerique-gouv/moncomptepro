-- This script:
-- - override data at specified id without deleting database
-- - is idempotent.

INSERT INTO users
  (id, email, email_verified, encrypted_password, created_at, updated_at, verify_email_sent_at, given_name, family_name,
   phone_number, job)
VALUES
  (1,
   'user@yopmail.com',
   'true',
   '$2a$10$5oxACsw3NngPAXALyB2G3u/C0Ej0CFUyPJhPtyyHP737Xn3lW1Mv.', -- password is 'user@yopmail.com'
   CURRENT_TIMESTAMP,
   CURRENT_TIMESTAMP,
   CURRENT_TIMESTAMP,
   'Jean',
   'User',
   '0123456789',
   'International knowledge practice leader'),
  -- password for the following user is 'password123'
  (2, 'user2@yopmail.com', 'true', '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'User10', '0123456789', 'Sbire')
ON CONFLICT (id)
  DO UPDATE
  SET (email, email_verified, encrypted_password, created_at, updated_at, given_name, family_name, phone_number, job)
    = (EXCLUDED.email, EXCLUDED.email_verified, EXCLUDED.encrypted_password, EXCLUDED.created_at,
       EXCLUDED.updated_at, EXCLUDED.given_name, EXCLUDED.family_name, EXCLUDED.phone_number, EXCLUDED.job);

SELECT setval(
    'users_id_seq',
    GREATEST(
        (SELECT MAX(id) FROM users),
        (SELECT last_value FROM users_id_seq)
      )
  );

INSERT INTO organizations
  (id, siret, authorized_email_domains, created_at, updated_at)
VALUES
  (1, '21920023500014', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, '13002526500013', '{"beta.gouv.fr"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)

ON CONFLICT (id)
  DO UPDATE
  SET (siret, authorized_email_domains, created_at, updated_at)
    = (EXCLUDED.siret, EXCLUDED.authorized_email_domains, EXCLUDED.created_at, EXCLUDED.updated_at);

SELECT setval(
    'organizations_id_seq',
    GREATEST(
        (SELECT MAX(id) FROM organizations),
        (SELECT last_value FROM organizations_id_seq)
      )
  );

INSERT INTO users_organizations
  (user_id, organization_id)
VALUES
  (1, 1),
  (2, 2)
ON CONFLICT DO NOTHING;

SELECT setval(
    'oidc_clients_id_seq',
    GREATEST(
        (SELECT MAX(id) FROM oidc_clients),
        (SELECT last_value FROM oidc_clients_id_seq)
      )
  );
