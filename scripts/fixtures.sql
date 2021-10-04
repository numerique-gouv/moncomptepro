INSERT INTO users (id, email, email_verified, encrypted_password, created_at, updated_at, given_name, family_name)
VALUES
  (
    1,
    'user@yopmail.com', -- keep these emails synchronised with the corresponding emails in signup-back/test/fixtures/users.yml
    'true',
    '$2a$10$5oxACsw3NngPAXALyB2G3u/C0Ej0CFUyPJhPtyyHP737Xn3lW1Mv.', -- password is 'user@yopmail.com'
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'User',
    'Test'
  ),
  (
    2,
    'api-particulier@yopmail.com',
    'true',
    '$2a$10$lciw8zIj7f46yqINJUkWUe1ZeZQRwLym/v7bO9Vza6w0Jtxzd6u5m', -- password is 'api-particulier@yopmail.com'
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Particulier',
    'Test'
  ),
  (
    3,
    'franceconnect@yopmail.com',
    'true',
    '$2a$10$dHC3xdeOc8BuXwmF/nD7R.8TWAj2tU/hyybXr3VzIxrBg9Lynt5WK', -- password is 'franceconnect@yopmail.com'
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Franceconnect',
    'Test'
  ),
  (
    4,
    'api-entreprise@yopmail.com',
    'true',
    '$2a$10$K92VjN/bxsU3PEdK.McpIe7VO7XC.ESse4Lk2BPLmR4QwkcHKLt7K', -- password is 'api-entreprise@yopmail.com'
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Entreprise',
    'Test'
  ),
  (
    5,
    'api-impot-particulier@yopmail.com',
    'true',
    '$2a$10$24hdVRIbS6swY.zQy6wNXeeOCPOj.efXsBWfvGSqyvXaMsFC.fltq', -- password is 'api-impot-particulier@yopmail.com'
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Impôt particulier',
    'Test'
  ),
  (
    6,
    'datapass@yopmail.com',
    'true',
    '$2a$10$P/M19MBC3b/k64X2QX4tQeMnvYUIkGPKhSx7CP9g02xoiA.ZRFg9C', -- password is 'datapass@yopmail.com'
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Administrator',
    'Test'
  )
ON CONFLICT (id)
DO UPDATE
  SET (email, email_verified, encrypted_password, created_at, updated_at, given_name, family_name)
  = (EXCLUDED.email, EXCLUDED.email_verified, EXCLUDED.encrypted_password, EXCLUDED.created_at, EXCLUDED.updated_at, EXCLUDED.given_name, EXCLUDED.family_name);

INSERT INTO organizations (id, siret, authorized_email_domains)
VALUES
  (1, '21920023500014', '{"yopmail.com"}'),
  (2, '13002526500013', '{"yopmail.com"}')
ON CONFLICT (id)
DO UPDATE
  SET (siret, authorized_email_domains)
  = (EXCLUDED.siret, EXCLUDED.authorized_email_domains);

INSERT INTO users_organizations (user_id, organization_id)
VALUES
  (1, 1),
  (2, 2),
  (3, 2),
  (4, 2),
  (5, 2),
  (6, 2)
ON CONFLICT DO NOTHING;

INSERT INTO oidc_clients (id, name, client_id, client_secret, redirect_uris, post_logout_redirect_uris, scope)
VALUES
  (
    1,
    'datapass.api.gouv.fr',
    '82546188522214c3577d35c283ce8842786649b35a026a9d44908037a597f29b',
    '1ff180ba922fbbbb4cf6fe0d3e82efadaa48a14de454a2137e2d656aac5e97c4',
    '{"https://back.datapass-development.api.gouv.fr/users/auth/api_gouv/callback"}',
    '{"https://datapass-development.api.gouv.fr", "http://localhost:3000"}',
    'openid email profile organizations'
  ),
  (
    2,
    'api-particulier-auth',
    'dc1328d666cefc1f0ca9b14d6cde82d03f24a64ed9a0aeb861ccc200aba505f9',
    'e82cd22f5941761e05cec47010254f39f1315ccd06c0bf8bf7527255d5d88412',
    '{"https://particulier-development.api.gouv.fr/admin/oauth-callback"}',
    '{}',
    'openid email'
  )
ON CONFLICT (id)
DO UPDATE
  SET (name, client_id, client_secret, redirect_uris, post_logout_redirect_uris, scope)
  = (EXCLUDED.name, EXCLUDED.client_id, EXCLUDED.client_secret, EXCLUDED.redirect_uris, EXCLUDED.post_logout_redirect_uris, EXCLUDED.scope);
