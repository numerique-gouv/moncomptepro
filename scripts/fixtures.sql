INSERT INTO users (id, email, created_at, updated_at)
VALUES
  (
-- keep this id synchronised with the corresponding uid in signup-back/test/fixtures/users.yml
  1,
  'service_provider@domain.user',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
  )
ON CONFLICT (id)
DO UPDATE
  SET (id, email, created_at, updated_at)
  = (EXCLUDED.id, EXCLUDED.email, EXCLUDED.created_at, EXCLUDED.updated_at);

-- TODO Add validated email here
INSERT INTO users (email, email_verified, encrypted_password, created_at, updated_at, roles)
VALUES
  (
  'particulier@domain.user',
  'true',
--  hashed 'password' string
  '$2a$11$LERSTLNbSPG./JlOreoz3u7Tt8MtEAfgEb.FvO4LG4VJ6BgQCxuNi',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  '{"api_particulier","api-particulier-token-admin"}'
  ),
  (
  'franceconnect@domain.user',
  'true',
--  hashed 'password' string
  '$2a$11$oFX9YmL11QNRdebu9HsQqeDHkCXEUgXicBmwY4N7ImcN1WVz67ku2',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  '{"franceconnect"}'
  ),
  (
  'api_droits_cnam@domain.user',
  'true',
--  hashed 'password' string
  '$2a$11$mc1hvQrVd2w2CdXN.SnRAusxztIRP7DB.taBGZz2W9GEbQaVsBnsa',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  '{"api_droits_cnam"}'
  ),
  (
  'dgfip@domain.user',
  'true',
--  hashed 'password' string
  '$2a$11$kwLTRJFLWckwieevXHTqu.scZ3tnwy0spo0btQfmKvCX5WwHjlqv6',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  '{"dgfip"}'
  ),
  (
  'service_provider@domain.user',
  'true',
--  hashed 'password' string
  '$2a$11$TzOShc0yg7K0nahltAI9fOJmuoaPqmawZ0geuZ/JFsTXFdM3Xsq.m',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  '{"service_provider"}'
  )
ON CONFLICT (email)
DO UPDATE
  SET (email_verified, encrypted_password, created_at, updated_at, roles)
  = (EXCLUDED.email_verified, EXCLUDED.encrypted_password, EXCLUDED.created_at, EXCLUDED.updated_at, EXCLUDED.roles);

INSERT INTO oidc_clients (id, name, client_id, client_secret, redirect_uris)
VALUES
  (
  1,
  'signup.api.gouv.fr',
  '82546188522214c3577d35c283ce8842786649b35a026a9d44908037a597f29b',
  '1ff180ba922fbbbb4cf6fe0d3e82efadaa48a14de454a2137e2d656aac5e97c4',
  '{"https://back.signup-development.api.gouv.fr/users/auth/api_gouv/callback"}'
  ),
  (
  2,
  'api-particulier-auth',
  'dc1328d666cefc1f0ca9b14d6cde82d03f24a64ed9a0aeb861ccc200aba505f9',
  'e82cd22f5941761e05cec47010254f39f1315ccd06c0bf8bf7527255d5d88412',
  '{"https://particulier-development.api.gouv.fr/admin/oauth-callback"}'
  )
ON CONFLICT (id)
DO UPDATE
  SET (name, client_id, client_secret, redirect_uris)
  = (EXCLUDED.name, EXCLUDED.client_id, EXCLUDED.client_secret, EXCLUDED.redirect_uris);
