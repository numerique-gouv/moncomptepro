-- This script:
-- - override data at specified id without deleting database
-- - is idempotent.

INSERT INTO users
  (id, email, email_verified, encrypted_password, created_at, updated_at, given_name, family_name,
   phone_number, job)
VALUES
  (1,
   'user@yopmail.com', -- keep these emails synchronised with the corresponding emails in signup-back/test/fixtures/users.yml
   'true',
   '$2a$10$5oxACsw3NngPAXALyB2G3u/C0Ej0CFUyPJhPtyyHP737Xn3lW1Mv.', -- password is 'user@yopmail.com'
   CURRENT_TIMESTAMP,
   CURRENT_TIMESTAMP,
   'Jean',
   'User',
   '0123456789',
   'International knowledge practice leader'),
  (2,
   'api-particulier@yopmail.com',
   'true',
   '$2a$10$lciw8zIj7f46yqINJUkWUe1ZeZQRwLym/v7bO9Vza6w0Jtxzd6u5m', -- password is 'api-particulier@yopmail.com'
   CURRENT_TIMESTAMP,
   CURRENT_TIMESTAMP,
   'Jean',
   'Particulier',
   '0123456789',
   'Key operation squad leader'),
  (3,
   'franceconnect@yopmail.com',
   'true',
   '$2a$10$dHC3xdeOc8BuXwmF/nD7R.8TWAj2tU/hyybXr3VzIxrBg9Lynt5WK', -- password is 'franceconnect@yopmail.com'
   CURRENT_TIMESTAMP,
   CURRENT_TIMESTAMP,
   'Jean',
   'FranceConnect',
   '0123456789',
   'Executive talent developer'),
  (4,
   'api-entreprise@yopmail.com',
   'true',
   '$2a$10$K92VjN/bxsU3PEdK.McpIe7VO7XC.ESse4Lk2BPLmR4QwkcHKLt7K', -- password is 'api-entreprise@yopmail.com'
   CURRENT_TIMESTAMP,
   CURRENT_TIMESTAMP,
   'Jean',
   'API Entreprise',
   '0123456789',
   'Chief account entrepreneur'),
  (5,
   'api-impot-particulier@yopmail.com',
   'true',
   '$2a$10$24hdVRIbS6swY.zQy6wNXeeOCPOj.efXsBWfvGSqyvXaMsFC.fltq', -- password is 'api-impot-particulier@yopmail.com'
   CURRENT_TIMESTAMP,
   CURRENT_TIMESTAMP,
   'Jean',
   'API Impôt particulier',
   '0123456789',
   'International career development developer'),
  (6,
   'datapass@yopmail.com',
   'true',
   '$2a$10$P/M19MBC3b/k64X2QX4tQeMnvYUIkGPKhSx7CP9g02xoiA.ZRFg9C', -- password is 'datapass@yopmail.com'
   CURRENT_TIMESTAMP,
   CURRENT_TIMESTAMP,
   'Jean',
   'Administrateur',
   '0123456789',
   'Senior costumer experience squad leader'),
  (7,
   'editeur@yopmail.com',
   'true',
   '$2a$10$L6m/QdGQI4.DuS46Dv7q0OK0V5vfwgHi7ClkrNSUIYn5q5o4K3uDm', -- password is 'editeur@yopmail.com'
   CURRENT_TIMESTAMP,
   CURRENT_TIMESTAMP,
   'Jean',
   'Éditeur',
   '0123456789',
   'Président des affaires, gère beaucoup de business'),
  -- password for the following user is 'password123'
  (10, 'user10@yopmail.com', 'true', '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'User10', '0123456789', 'Sbire'),
  (11, 'user11@yopmail.com', 'true', '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'User11', '0123456789', 'Sbire'),
  (12, 'user12@yopmail.com', 'true', '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'User12', '0123456789', 'Sbire'),
  (13, 'user13@yopmail.com', 'true', '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'User13', '0123456789', 'Sbire'),
  (14, 'user14@yopmail.com', 'true', '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'User14', '0123456789', 'Sbire'),
  (15, 'user15@yopmail.com', 'true', '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'User15', '0123456789', 'Sbire'),
  (16, 'user16@yopmail.com', 'true', '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'User16', '0123456789', 'Sbire'),
  (17, 'user17@yopmail.com', 'true', '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'User17', '0123456789', 'Sbire'),
  (18, 'user18@yopmail.com', 'true', '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'User18', '0123456789', 'Sbire'),
  (19, 'user19@yopmail.com', 'true', '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'User19', '0123456789', 'Sbire'),
  (20, 'wanajoin@beta.gouv.fr', 'true', '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'Wanajoin', '0123456789', 'Sbire')
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
  (2, '13002526500013', '{"beta.gouv.fr"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, '21130055300016', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, '21690123100011', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5, '21310555400017', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (6, '21330063500017', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (7, '21060088800015', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (8, '21440109300015', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (9, '21510421700017', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (10, '21340172201787', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (11, '21670482500019', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (12, '21350238800019', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (13, '21760351300011', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (14, '21830137200015', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (15, '21590350100017', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (16, '21420218600018', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (17, '21250056500016', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (18, '20006340200016', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (19, '21380185500015', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (20, '21740056300011', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (21, '21800019800018', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (22, '21370261600011', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (23, '21300189400012', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (24, '21450234600015', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (25, '21720181300011', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (26, '20006541500016', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (27, '21680224900013', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (28, '21490007800012', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (29, '20005684400018', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (30, '21930048000015', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (31, '21570463600012', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (32, '20005686900015', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (33, '21100374400011', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (34, '21590599300014', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (35, '21290019500018', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (36, '21660136900012', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (37, '21930001900011', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (38, '21950018800012', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (39, '21930066200018', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (40, '21950127700897', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (41, '21590512600011', '{"yopmail.com"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
  (2, 2),
  (3, 2),
  (4, 2),
  (5, 2),
  (6, 2),
  (7, 3),
  (7, 4),
  (7, 5),
  (7, 6),
  (7, 7),
  (7, 8),
  (7, 9),
  (7, 10),
  (7, 11),
  (7, 12),
  (7, 13),
  (7, 14),
  (7, 15),
  (7, 16),
  (7, 17),
  (7, 18),
  (7, 19),
  (7, 20),
  (7, 21),
  (7, 22),
  (7, 23),
  (7, 24),
  (7, 25),
  (7, 26),
  (7, 27),
  (7, 28),
  (7, 29),
  (7, 30),
  (7, 31),
  (7, 32),
  (7, 33),
  (7, 34),
  (7, 35),
  (7, 36),
  (7, 37),
  (7, 38),
  (7, 39),
  (7, 40),
  (7, 41),
  (10, 2),
  (11, 2),
  (12, 2),
  (13, 2),
  (14, 2),
  (15, 2),
  (16, 2),
  (17, 2),
  (18, 2),
  (19, 2)
ON CONFLICT DO NOTHING;

INSERT INTO oidc_clients
  (id, name, client_id, client_secret, redirect_uris, post_logout_redirect_uris, scope)
VALUES
  (1,
   'datapass.api.gouv.fr',
   'nCDCeAfS0qpxr2kzps7nUClRGUZ1CgnzNQ2JqIZKDPUHrQoqzAuVI7I0dh41dHJHyrkvHzvjUFwoooB71VbkmGykjAba2UcxJBhJL4RUO3niaqyWV7zma8KsS4CGsbIa',
   'Q8alcDUf9NwwfkPx4s3GPgac0FsZ6ZdZMIFvnbqabGuZ8JwwqyJy46MgOGuUgw43Hnzjzfzzt7B64937oCmtmmxqvY9ftQyXIhMxRzNn73UspWHKv9wv2HqtTD82LTxV',
   '{"https://back.datapass-development.api.gouv.fr/users/auth/api_gouv/callback", "https://back.datapass-test.api.gouv.fr/users/auth/api_gouv/callback", "http://localhost:3001/users/auth/api_gouv/callback"}',
   '{"http://localhost:3000", "http://localhost:3001", "https://datapass-development.api.gouv.fr"}',
   'openid email profile organizations'),
  (2,
   'api-particulier-auth',
   'dc1328d666cefc1f0ca9b14d6cde82d03f24a64ed9a0aeb861ccc200aba505f9',
   'e82cd22f5941761e05cec47010254f39f1315ccd06c0bf8bf7527255d5d88412',
   '{"https://particulier-development.api.gouv.fr/admin/oauth-callback"}',
   '{}',
   'openid email'),
  (3,
   'dashboard.entreprise.api.gouv.fr',
   '4442bfd8caac8e19ff202d33060edcd248592662d5a8098e28b706ba906fe9e0db95ad336c38248f42896db272990b8dfc969d8b8857101dabf9b2ffe7ec49b9',
   'oauth_api_gouv_client_secret',
    '{"http://particulier.api.localtest.me:5000/auth/api_gouv/callback", "http://entreprise.api.localtest.me:5000/auth/api_gouv/callback", "http://localhost:5000/auth/api_gouv/callback", "http://particulier.api.localtest.me:3000/auth/api_gouv/callback", "http://entreprise.api.localtest.me:3000/auth/api_gouv/callback", "http://localhost:3000/auth/api_gouv/callback", "https://sandbox.dashboard.entreprise.api.gouv.fr/auth/api_gouv/callback", "https://sandbox1.entreprise.api.gouv.fr/auth/api_gouv/callback", "https://sandbox2.entreprise.api.gouv.fr/auth/api_gouv/callback"}',
    '{"http://particulier.api.localtest.me:5000", "http://entreprise.api.localtest.me:5000", "http://localhost:5000", "http://particulier.api.localtest.me:3000", "http://entreprise.api.localtest.me:3000", "http://localhost:3000", "https://sandbox.dashboard.entreprise.api.gouv.fr/", "https://sandbox1.entreprise.api.gouv.fr/", "https://sandbox2.entreprise.api.gouv.fr/"}',
   'openid email')
ON CONFLICT (id)
  DO UPDATE
  SET (name, client_id, client_secret, redirect_uris, post_logout_redirect_uris, scope)
    = (EXCLUDED.name, EXCLUDED.client_id, EXCLUDED.client_secret, EXCLUDED.redirect_uris,
       EXCLUDED.post_logout_redirect_uris, EXCLUDED.scope);

SELECT setval(
    'oidc_clients_id_seq',
    GREATEST(
        (SELECT MAX(id) FROM oidc_clients),
        (SELECT last_value FROM oidc_clients_id_seq)
      )
  );
