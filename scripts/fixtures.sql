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
  (id, client_name, client_id, client_secret, redirect_uris, post_logout_redirect_uris, scope, client_uri, client_description, client_user_can_description)
VALUES
  (1,
   'DataPass',
   'nCDCeAfS0qpxr2kzps7nUClRGUZ1CgnzNQ2JqIZKDPUHrQoqzAuVI7I0dh41dHJHyrkvHzvjUFwoooB71VbkmGykjAba2UcxJBhJL4RUO3niaqyWV7zma8KsS4CGsbIa',
   'Q8alcDUf9NwwfkPx4s3GPgac0FsZ6ZdZMIFvnbqabGuZ8JwwqyJy46MgOGuUgw43Hnzjzfzzt7B64937oCmtmmxqvY9ftQyXIhMxRzNn73UspWHKv9wv2HqtTD82LTxV',
   ARRAY [
     'https://back.datapass-development.api.gouv.fr/users/auth/api_gouv/callback',
     'https://back.datapass-test.api.gouv.fr/users/auth/api_gouv/callback',
     'http://localhost:3001/users/auth/api_gouv/callback'
     ],
   ARRAY [
     'http://localhost:3000',
     'http://localhost:3001',
     'https://datapass-development.api.gouv.fr'
     ],
   'openid email profile organizations',
   'https://datapass-development.api.gouv.fr',
   'Centralisez vos demandes d’habilitations juridiques pour accéder aux données et services en accès restreint.',
   'effectuer des démarches au nom de votre organisation sur DataPass, l’outil d’habilitation juridique'),
  (2,
   'API Particulier',
   '844e3bff46ebdac9beb18c6cf793dedfdb1776262911b3d927d24871f03e46b38756b5d015d1a693057328d8673408cccf48ef7c5a6e94fa5d101042663fb5b1',
   'oauth_api_gouv_client_secret_particulier',
   ARRAY [
     'http://particulier.api.localtest.me:3000/auth/api_gouv/callback',
     'http://particulier.api.localtest.me:3000/auth/api_gouv_particulier/callback',
     'http://particulier.api.localtest.me:5000/auth/api_gouv/callback',
     'http://particulier.api.localtest.me:5000/auth/api_gouv_particulier/callback',
     'http://localhost:3000/auth/api_gouv/callback',
     'http://localhost:3000/auth/api_gouv_particulier/callback',
     'http://localhost:5000/auth/api_gouv/callback',
     'http://localhost:3000/auth/api_gouv_particulier/callback',
     'https://sandbox.particulier.api.gouv.fr/auth/api_gouv/callback',
     'https://sandbox.particulier.api.gouv.fr/auth/api_gouv_particulier/callback',
     'https://sandbox1.particulier.api.gouv.fr/auth/api_gouv/callback',
     'https://sandbox1.particulier.api.gouv.fr/auth/api_gouv_particulier/callback',
     'https://sandbox2.particulier.api.gouv.fr/auth/api_gouv/callback',
     'https://sandbox2.particulier.api.gouv.fr/auth/api_gouv_particulier/callback',
     'https://staging.particulier.api.gouv.fr/auth/api_gouv/callback',
     'https://staging.particulier.api.gouv.fr/auth/api_gouv_particulier/callback',
     'https://staging1.particulier.api.gouv.fr/auth/api_gouv/callback',
     'https://staging1.particulier.api.gouv.fr/auth/api_gouv_particulier/callback',
     'https://staging2.particulier.api.gouv.fr/auth/api_gouv/callback',
     'https://staging2.particulier.api.gouv.fr/auth/api_gouv_particulier/callback'
     ],
   ARRAY [
     'http://particulier.api.localtest.me:3000',
     'http://particulier.api.localtest.me:5000',
     'http://localhost:3000',
     'http://localhost:5000',
     'https://sandbox.particulier.api.gouv.fr/',
     'https://sandbox1.particulier.api.gouv.fr/',
     'https://sandbox2.particulier.api.gouv.fr/',
     'https://staging.particulier.api.gouv.fr/',
     'https://staging1.particulier.api.gouv.fr/',
     'https://staging2.particulier.api.gouv.fr/'
     ],
   'openid email',
   'http://particulier.api.localtest.me',
   'Bouquet de données proposé pour simplifier les démarches administratives.',
   'gérer un jeton d’accès API Particulier pour récupérer des données de particuliers pour votre organisation'),
  (3,
   'API Entreprise',
   '4442bfd8caac8e19ff202d33060edcd248592662d5a8098e28b706ba906fe9e0db95ad336c38248f42896db272990b8dfc969d8b8857101dabf9b2ffe7ec49b9',
   'oauth_api_gouv_client_secret_entreprise',
   ARRAY [
     'http://entreprise.api.localtest.me:3000/auth/api_gouv/callback',
     'http://entreprise.api.localtest.me:3000/auth/api_gouv_entreprise/callback',
     'http://entreprise.api.localtest.me:5000/auth/api_gouv/callback',
     'http://entreprise.api.localtest.me:5000/auth/api_gouv_entreprise/callback',
     'http://localhost:3000/auth/api_gouv/callback',
     'http://localhost:3000/auth/api_gouv_entreprise/callback',
     'http://localhost:5000/auth/api_gouv/callback',
     'http://localhost:5000/auth/api_gouv_entreprise/callback',
     'https://sandbox.entreprise.api.gouv.fr/auth/api_gouv/callback',
     'https://sandbox.entreprise.api.gouv.fr/auth/api_gouv_entreprise/callback',
     'https://sandbox1.entreprise.api.gouv.fr/auth/api_gouv/callback',
     'https://sandbox1.entreprise.api.gouv.fr/auth/api_gouv_entreprise/callback',
     'https://sandbox2.entreprise.api.gouv.fr/auth/api_gouv/callback',
     'https://sandbox2.entreprise.api.gouv.fr/auth/api_gouv_entreprise/callback',
     'https://staging.entreprise.api.gouv.fr/auth/api_gouv/callback',
     'https://staging.entreprise.api.gouv.fr/auth/api_gouv_entreprise/callback',
     'https://staging1.entreprise.api.gouv.fr/auth/api_gouv/callback',
     'https://staging1.entreprise.api.gouv.fr/auth/api_gouv_entreprise/callback',
     'https://staging2.entreprise.api.gouv.fr/auth/api_gouv/callback',
     'https://staging2.entreprise.api.gouv.fr/auth/api_gouv_entreprise/callback'
     ],
   ARRAY [
     'http://entreprise.api.localtest.me:3000',
     'http://entreprise.api.localtest.me:5000',
     'http://localhost:3000',
     'http://localhost:5000',
     'https://sandbox.entreprise.api.gouv.fr/',
     'https://sandbox1.entreprise.api.gouv.fr/',
     'https://sandbox2.entreprise.api.gouv.fr/',
     'https://staging.entreprise.api.gouv.fr/',
     'https://staging1.entreprise.api.gouv.fr/',
     'https://staging2.entreprise.api.gouv.fr/'
     ],
   'openid email',
   'http://entreprise.api.localtest.me',
   'Permet aux entités administratives d’accéder aux données et aux documents administratifs des entreprises et des associations, afin de simplifier leurs démarches.',
   'gérer un jeton d’accès API Entreprise pour récupérer des données d’entreprise pour votre organisation'),
  (4,
   'Grist - ANCT',
   '333ba6a6fd9303ab727159eeed704bcbc2549e56cd294fdf58621f01b1856898d18c6b20dd2cec21d4dc06746453331328a1b2c1abe365a92bb2a2f3b9d68c69',
   '031da300506ac31fac6feaf88575b94b886eae7a68c64327ee03e0fa635ae9ae28572e4de53bb435b3fce4f8ac8484334d71de48f3c9abed3709c730173e0fe0',
   ARRAY [
     'https://grist.dev.incubateur.anct.gouv.fr/_oauth'
     ],
   ARRAY [
     'https://grist.dev.incubateur.anct.gouv.fr'
     ],
   'openid email organizations',
   'https://grist.dev.incubateur.anct.gouv.fr',
   'Saisir et manipuler collaborativement les données',
   'utiliser le tableur Grist en collaboration avec des membres de votre organisation'),
  (5,
   'Annuaire des Entreprises',
   '233ba6a6fd9303ab727159eeed704bcbc2549e56cd294fdf58621f01b1856898d18c6b20dd2cec21d4dc06746453331328a1b2c1abe365a92bb2a2f3b9d68c69',
   '031da300506ac31fac6feaf88575b94b886eae7a68c64327ee03e0fa635ae9ae28572e4de53bb435b3fce4f8ac8484334d71de48f3c9abed3709c730173e0fe0',
   ARRAY [
     'http://localhost:3000/api/auth/mon-compte-pro/callback',
     'https://test.annuaire-entreprises.data.gouv.fr/api/auth/mon-compte-pro/callback'
     ],
   ARRAY [
     'http://localhost:3000/api/auth/mon-compte-pro/logout-callback',
     'https://test.annuaire-entreprises.data.gouv.fr/api/auth/mon-compte-pro/logout-callback'
     ],
   'openid email',
   'http://localhost:3000/connexion/agent-public',
   'Accédez à l’espace agent public sur l’Annuaire des Entreprises.',
   'accéder à des données à accès restreint sur l’Annuaire des Entreprises'),
  (6,
   'Keycloak test - CD12',
   'RWh9+Hyv1SGrUdt8+nKey8K6RbPn9GkXqitpTHKRKChSmfICA5fl9YIhKrUtkPtlfPl4oNhfsg56B4DH+/jsoaHwFjC+UKbWKwxgzjPWuzh4AG2er173fVq/U2TGxaXU',
   'lmB72ac+JKZPUmg3+vlo9dPMkCRnFRyz+NE+lslJFX07V4JObFZ0H/vXnXB5Jzu1s96KLU5FmirsfqsKLeVukHBO6Vmy6dfcwKfjMGgWTBD6ik01KUcFq2f3bx5nO6yj',
   ARRAY [
     'https://keycloak.lab.aveyron.fr/realms/MCP/broker/oidc/endpoint',
     'https://keycloak.lab.aveyron.fr/realms/MCP/broker/moncomptepro/endpoint'
     ],
   ARRAY [
     'https://keycloak.lab.aveyron.fr'
     ],
   'openid email profile organizations',
   'https://keycloak.lab.aveyron.fr',
   'Authentifie les partenaires du Département de l’Aveyron',
   'effectuer des démarches auprès du département de l’Aveyron au nom de votre organisation'),
  (7,
   'Tous à Bord',
   'nCDCeAfS0qpxr2kzps7fDQSD323DRanzNQ2JqIZKDPUHrQoqzAuVI7I0dh41dHJHyrkvHzvjUFwoooB71VbkmGykjAba2UcxJBhJL4RUO3niaqyWV7zma8KsS4CGsbIa',
   'Q8alcDUf9NwwfkPx4s3GPgac0FsZ6ZdZMIFvnbqabGuZFL4SqyJy46MgOGuUgw43Hnzjzfzzt7B64937oCmtmmxqvY9ftQyXIhMxRzNn73UspWHKv9wv2HqtTD82LTxV',
   ARRAY [
     'http://127.0.0.1:8000/oidc/callback/',
     'http://localhost:8000/oidc/callback/',
     'https://tous-a-bord.beta.gouv.fr/oidc/callback/',
     'https://tous-a-bord-staging.beta.gouv.fr/oidc/callback/'
     ],
   ARRAY [
     'http://127.0.0.1:8000/oidc/logout',
     'http://localhost:8000/oidc/logout',
     'https://tous-a-bord.beta.gouv.fr/oidc/logout',
     'https://tous-a-bord-staging.beta.gouv.fr/oidc/logout'
     ],
   'openid email',
   'https://tous-a-bord.beta.gouv.fr',
   'Vérifie l’éligibilité de bénéficiaires d’aides au transport',
   'vérifier l’éligibilité de bénéficiaires d’aides au transport pour votre organisation sur Tous à Bord'),
  (8,
    'BaseProjectSIDDEE',
    'test_baseproject_SIDDEE',
    'test_baseproject_SIDDEEh#%!tbt#ux5)xr)e7z37%l(zu13w0cj0#2sxnx&6*wx$+zvl9n',
    ARRAY [
      'http://10.59.128.114:8001/auth/cb/',
      'http://10.59.128.114:8001/oidc/auth/cb/'
    ],
    ARRAY [
      'http://10.59.128.114:8001/'
    ],
    'openid email',
    'http://10.59.128.114:8001/',
    'Dépôt de demandes auprès du service IDDEE de la DREAL HdF',
    null),
  (9,
    'Annuaire des collectivités',
    'tdi1iyp2stw4w1ipl9hgye9qvfm9tbgi4cxu574rkwufkocux620r4c09tpm3apsav1rg7ex5j79w2vfsnrl1v4ewlkxrm45wtt9g8x3arsco1u86xeh9j4enus14vsi',
    'pqnu9wbs0h5pkbqeni2bx55mnvgxzta3d9wmu2h6yyxmf7303b5eapi4o4plue10bcj9n1iyoilbz07b2iokr4dcw3jsqitb7lc88n9cuxn9p9v0cqstfxgu82d392vn',
    ARRAY [
      'http://127.0.0.1:1337/oidc/callback/',
      'http://localhost:1337/oidc/callback/',
      'https://annuaire-des-collectivites.dev.incubateur.anct.gouv.fr/oidc/callback/'
    ],
    ARRAY [
      'http://127.0.0.1:1337/oidc/logout',
      'http://localhost:1337/oidc/logout',
      'https://annuaire-des-collectivites.dev.incubateur.anct.gouv.fr/oidc/logout'
    ],
    'openid email',
    'https://annuaire-des-collectivites.dev.incubateur.anct.gouv.fr/',
    'Accès à l’interface d’administration de l’annuaire pour les agents des communes',
    'administrer les données de l’annuaire des collectivités pour votre organisation'),
  (10,
    'data.gouv.fr',
    '277aa530830cac03a81a5670ec13d8677291658aa0b3138c733697c9915f4a2593d5faa968143f29e893aafb8a1ffba9593c52d46db13a27cf4d3fc3485ada90',
    'e25aa11f53f13a58e8c1fe022ddc0e07e240ec0c603f78535bf5ffd470c387be2e2edc348d6923fd718b989da08a40f241543d8c1e01bbaf88ad0ec84ed9140f',
    ARRAY [
      'http://dev.local:7000/fr/mcp/auth',
      'http://dev.local:7000/api/1/mcp/',
      'http://dev.local:7000/api/2/mcp/',
      'https://dev.data.gouv.fr/api/1/mcp/'
    ],
    ARRAY [
      'http://dev.local:7000/',
      'https://dev.data.gouv.fr/'
      ],
   'openid email profile',
    'https://dev.data.gouv.fr/',
    'Plateforme ouverte des données publiques françaises.',
    null),
  (11,
   'Oidc Test Client',
   'test-id',
   'test-secret',
   ARRAY [
     'http://localhost:9009/auth/callback'
     ],
   ARRAY []::varchar[],
   'openid email organizations',
   'http://localhost:9009/',
   'This is a small, golang-based OIDC Client, to be used in End-to-end or other testing. More info: https://hub.docker.com/r/beryju/oidc-test-client.',
   null),
  (12,
   'Ma Cantine dev local',
   '7j0HTA411LSa1n4lO54gv6uMEWCey4RYwjnSQyUWcMQ7QM6SACLs8A1UTu4G0K831j4AqaZ3ZOHO98Agn5DGgjHx3J2n5F1YYEFZDmchqSv9ww1LLwXRMLJ7grT5Hl2D',
   'Jp0E7zVcoM7q1K74t372pU3aRk6uO5thM56A05mQHTXXVqCiDoTU9Bjru46DGvg4p4z3fwvQC5aXzgh7To14QskO35c92nw363tSEQHHlhfOVG16n7ZqSJ2FOattrYnD',
   ARRAY [
     'http://127.0.0.1:8000/signin-oidc'
     ],
   ARRAY [
     'http://127.0.0.1:8000/signout-callback-oidc'
     ],
   'openid email profile organizations',
   'http://127.0.0.1:8000/',
   'Mieux manger de la crèche à l’EHPAD',
   null)
ON CONFLICT (id)
  DO UPDATE
  SET (client_name, client_id, client_secret, redirect_uris, post_logout_redirect_uris, scope, client_uri,
       client_description)
    = (EXCLUDED.client_name, EXCLUDED.client_id, EXCLUDED.client_secret, EXCLUDED.redirect_uris,
       EXCLUDED.post_logout_redirect_uris, EXCLUDED.scope, EXCLUDED.client_uri, EXCLUDED.client_description);

SELECT setval(
    'oidc_clients_id_seq',
    GREATEST(
        (SELECT MAX(id) FROM oidc_clients),
        (SELECT last_value FROM oidc_clients_id_seq)
      )
  );
