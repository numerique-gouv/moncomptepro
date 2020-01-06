INSERT INTO users (id, email, email_verified, encrypted_password, created_at, updated_at, given_name, family_name, roles)
VALUES
  (
    1, -- keep this id synchronised with the corresponding uid in signup-back/test/fixtures/users.yml
    'user@test',
    'true',
    '$2a$11$TzOShc0yg7K0nahltAI9fOJmuoaPqmawZ0geuZ/JFsTXFdM3Xsq.m', -- hashed 'password' string
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'User',
    'Test',
    '{}'
  ),
  (
    2,
    'api_particulier@test',
    'true',
    '$2a$11$LERSTLNbSPG./JlOreoz3u7Tt8MtEAfgEb.FvO4LG4VJ6BgQCxuNi', -- hashed 'password' string
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Particulier',
    'Test',
    '{"api_particulier","api-particulier-token-admin"}'
  ),
  (
    3,
    'franceconnect@test',
    'true',
    '$2a$11$oFX9YmL11QNRdebu9HsQqeDHkCXEUgXicBmwY4N7ImcN1WVz67ku2', -- hashed 'password' string
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Franceconnect',
    'Test',
    '{"franceconnect"}'
  ),
  (
    4,
    'api_entreprise@test',
    'true',
    '$2a$11$LERSTLNbSPG./JlOreoz3u7Tt8MtEAfgEb.FvO4LG4VJ6BgQCxuNi', -- hashed 'password' string
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Entreprise',
    'Test',
    '{"api_entreprise"}'
  ),
  (
    5,
    'api_droits_cnam@test',
    'true',
    '$2a$11$mc1hvQrVd2w2CdXN.SnRAusxztIRP7DB.taBGZz2W9GEbQaVsBnsa', -- hashed 'password' string
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Cnam',
    'Test',
    '{"api_droits_cnam"}'
  ),
  (
    6,
    'api_impot_particulier@test',
    'true',
    '$2a$11$kwLTRJFLWckwieevXHTqu.scZ3tnwy0spo0btQfmKvCX5WwHjlqv6', -- hashed 'password' string
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'Dgfip',
    'Test',
    '{"api_impot_particulier", "api_impot_particulier_step2"}'
  )
ON CONFLICT (id)
DO UPDATE
  SET (email, email_verified, encrypted_password, created_at, updated_at, given_name, family_name, roles)
  = (EXCLUDED.email, EXCLUDED.email_verified, EXCLUDED.encrypted_password, EXCLUDED.created_at, EXCLUDED.updated_at, EXCLUDED.given_name, EXCLUDED.family_name, EXCLUDED.roles);

INSERT INTO organizations (id, siret, authorized_email_domains)
VALUES
  (1, '21920023500014', '{"test"}'),
  (2, '13002526500013', '{"test"}')
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

INSERT INTO oidc_clients (id, name, client_id, client_secret, redirect_uris, post_logout_redirect_uris)
VALUES
  (
    1,
    'signup.api.gouv.fr',
    '82546188522214c3577d35c283ce8842786649b35a026a9d44908037a597f29b',
    '1ff180ba922fbbbb4cf6fe0d3e82efadaa48a14de454a2137e2d656aac5e97c4',
    '{"https://back.signup-development.api.gouv.fr/users/auth/api_gouv/callback"}',
    '{"https://signup-development.api.gouv.fr"}'
  ),
  (
    2,
    'api-particulier-auth',
    'dc1328d666cefc1f0ca9b14d6cde82d03f24a64ed9a0aeb861ccc200aba505f9',
    'e82cd22f5941761e05cec47010254f39f1315ccd06c0bf8bf7527255d5d88412',
    '{"https://particulier-development.api.gouv.fr/admin/oauth-callback"}',
    '{}'
  )
ON CONFLICT (id)
DO UPDATE
  SET (name, client_id, client_secret, redirect_uris, post_logout_redirect_uris)
  = (EXCLUDED.name, EXCLUDED.client_id, EXCLUDED.client_secret, EXCLUDED.redirect_uris, EXCLUDED.post_logout_redirect_uris);
