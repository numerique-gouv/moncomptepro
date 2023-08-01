-- This script:
-- - override data at specified id without deleting database
-- - is idempotent.

INSERT INTO users
  (id, email, email_verified, email_verified_at, encrypted_password, created_at, updated_at, given_name, family_name,
   phone_number, job)
VALUES
  (1,
   'user@yopmail.com', -- keep these emails synchronised with the corresponding emails in signup-back/test/fixtures/users.yml
   'true',
   CURRENT_TIMESTAMP,
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
   CURRENT_TIMESTAMP,
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
   CURRENT_TIMESTAMP,
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
   CURRENT_TIMESTAMP,
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
   CURRENT_TIMESTAMP,
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
   CURRENT_TIMESTAMP,
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
   CURRENT_TIMESTAMP,
   '$2a$10$L6m/QdGQI4.DuS46Dv7q0OK0V5vfwgHi7ClkrNSUIYn5q5o4K3uDm', -- password is 'editeur@yopmail.com'
   CURRENT_TIMESTAMP,
   CURRENT_TIMESTAMP,
   'Jean',
   'Éditeur',
   '0123456789',
   'Président des affaires, gère beaucoup de business'),
  -- password for the following user is 'password123'
  (10, 'user10@yopmail.com', 'true', CURRENT_TIMESTAMP, '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'User10', '0123456789', 'Sbire'),
  (11, 'user11@yopmail.com', 'true', CURRENT_TIMESTAMP, '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'User11', '0123456789', 'Sbire'),
  (12, 'user12@yopmail.com', 'true', CURRENT_TIMESTAMP, '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'User12', '0123456789', 'Sbire'),
  (13, 'user13@yopmail.com', 'true', CURRENT_TIMESTAMP, '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'User13', '0123456789', 'Sbire'),
  (14, 'user14@yopmail.com', 'true', CURRENT_TIMESTAMP, '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'User14', '0123456789', 'Sbire'),
  (15, 'user15@yopmail.com', 'true', CURRENT_TIMESTAMP, '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'User15', '0123456789', 'Sbire'),
  (16, 'user16@yopmail.com', 'true', CURRENT_TIMESTAMP, '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'User16', '0123456789', 'Sbire'),
  (17, 'user17@yopmail.com', 'true', CURRENT_TIMESTAMP, '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'User17', '0123456789', 'Sbire'),
  (18, 'user18@yopmail.com', 'true', CURRENT_TIMESTAMP, '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'User18', '0123456789', 'Sbire'),
  (19, 'user19@yopmail.com', 'true', CURRENT_TIMESTAMP, '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'User19', '0123456789', 'Sbire'),
  (20, 'wanajoin@beta.gouv.fr', 'true', CURRENT_TIMESTAMP, '$2a$10$kzY3LINL6..50Fy9shWCcuNlRfYq0ft5lS.KCcJ5PzrhlWfKK4NIO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Jean', 'Wanajoin', '0123456789', 'Sbire')
ON CONFLICT (id)
  DO UPDATE
  SET (email, email_verified, email_verified_at, encrypted_password, created_at, updated_at, given_name, family_name, phone_number, job)
    = (EXCLUDED.email, EXCLUDED.email_verified, EXCLUDED.email_verified_at, EXCLUDED.encrypted_password, EXCLUDED.created_at,
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
  (user_id, organization_id, verification_type, authentication_by_peers_type, has_been_greeted)
VALUES
  (1, 1, 'verified_email_domain', 'all_members_notified', true),
  (2, 2, 'verified_email_domain', 'all_members_notified', true),
  (3, 2, 'verified_email_domain', 'all_members_notified', true),
  (4, 2, 'verified_email_domain', 'all_members_notified', true),
  (5, 2, 'verified_email_domain', 'all_members_notified', true),
  (6, 2, 'verified_email_domain', 'all_members_notified', true),
  (7, 3, 'verified_email_domain', 'all_members_notified', true),
  (7, 4, 'verified_email_domain', 'all_members_notified', true),
  (7, 5, 'verified_email_domain', 'all_members_notified', true),
  (7, 6, 'verified_email_domain', 'all_members_notified', true),
  (7, 7, 'verified_email_domain', 'all_members_notified', true),
  (7, 8, 'verified_email_domain', 'all_members_notified', true),
  (7, 9, 'verified_email_domain', 'all_members_notified', true),
  (7, 10, 'verified_email_domain', 'all_members_notified', true),
  (7, 11, 'verified_email_domain', 'all_members_notified', true),
  (7, 12, 'verified_email_domain', 'all_members_notified', true),
  (7, 13, 'verified_email_domain', 'all_members_notified', true),
  (7, 14, 'verified_email_domain', 'all_members_notified', true),
  (7, 15, 'verified_email_domain', 'all_members_notified', true),
  (7, 16, 'verified_email_domain', 'all_members_notified', true),
  (7, 17, 'verified_email_domain', 'all_members_notified', true),
  (7, 18, 'verified_email_domain', 'all_members_notified', true),
  (7, 19, 'verified_email_domain', 'all_members_notified', true),
  (7, 20, 'verified_email_domain', 'all_members_notified', true),
  (7, 21, 'verified_email_domain', 'all_members_notified', true),
  (7, 22, 'verified_email_domain', 'all_members_notified', true),
  (7, 23, 'verified_email_domain', 'all_members_notified', true),
  (7, 24, 'verified_email_domain', 'all_members_notified', true),
  (7, 25, 'verified_email_domain', 'all_members_notified', true),
  (7, 26, 'verified_email_domain', 'all_members_notified', true),
  (7, 27, 'verified_email_domain', 'all_members_notified', true),
  (7, 28, 'verified_email_domain', 'all_members_notified', true),
  (7, 29, 'verified_email_domain', 'all_members_notified', true),
  (7, 30, 'verified_email_domain', 'all_members_notified', true),
  (7, 31, 'verified_email_domain', 'all_members_notified', true),
  (7, 32, 'verified_email_domain', 'all_members_notified', true),
  (7, 33, 'verified_email_domain', 'all_members_notified', true),
  (7, 34, 'verified_email_domain', 'all_members_notified', true),
  (7, 35, 'verified_email_domain', 'all_members_notified', true),
  (7, 36, 'verified_email_domain', 'all_members_notified', true),
  (7, 37, 'verified_email_domain', 'all_members_notified', true),
  (7, 38, 'verified_email_domain', 'all_members_notified', true),
  (7, 39, 'verified_email_domain', 'all_members_notified', true),
  (7, 40, 'verified_email_domain', 'all_members_notified', true),
  (7, 41, 'verified_email_domain', 'all_members_notified', true),
  (10, 2, 'verified_email_domain', 'all_members_notified', true),
  (11, 2, 'verified_email_domain', 'all_members_notified', true),
  (12, 2, 'verified_email_domain', 'all_members_notified', true),
  (13, 2, 'verified_email_domain', 'all_members_notified', true),
  (14, 2, 'verified_email_domain', 'all_members_notified', true),
  (15, 2, 'verified_email_domain', 'all_members_notified', true),
  (16, 2, 'verified_email_domain', 'all_members_notified', true),
  (17, 2, 'verified_email_domain', 'all_members_notified', true),
  (18, 2, 'verified_email_domain', 'all_members_notified', true),
  (19, 2, 'verified_email_domain', 'all_members_notified', true)
ON CONFLICT (user_id, organization_id)
  DO UPDATE
  SET (verification_type, authentication_by_peers_type, has_been_greeted)
    = (EXCLUDED.verification_type, EXCLUDED.authentication_by_peers_type, EXCLUDED.has_been_greeted);

INSERT INTO oidc_clients
  (id, client_name, client_id, client_secret, redirect_uris,
   post_logout_redirect_uris, scope, client_uri, client_description,
   userinfo_signed_response_alg, id_token_signed_response_alg,
   authorization_signed_response_alg, introspection_signed_response_alg)
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
   'openid email profile phone organization organizations',
   'https://datapass-development.api.gouv.fr',
   'Centralisez vos demandes d’habilitations juridiques pour accéder aux données et services en accès restreint.',
   null, null, null, null),
  (2,
   'API Particulier',
   '844e3bff46ebdac9beb18c6cf793dedfdb1776262911b3d927d24871f03e46b38756b5d015d1a693057328d8673408cccf48ef7c5a6e94fa5d101042663fb5b1',
   'oauth_api_gouv_client_secret_particulier',
   ARRAY [
     'http://particulier.api.localtest.me:3000/auth/api_gouv_particulier/callback',
     'http://particulier.api.localtest.me:5000/auth/api_gouv_particulier/callback',
     'https://sandbox.particulier.api.gouv.fr/auth/api_gouv_particulier/callback',
     'https://sandbox1.particulier.api.gouv.fr/auth/api_gouv_particulier/callback',
     'https://sandbox2.particulier.api.gouv.fr/auth/api_gouv_particulier/callback',
     'https://staging.particulier.api.gouv.fr/auth/api_gouv_particulier/callback',
     'https://staging1.particulier.api.gouv.fr/auth/api_gouv_particulier/callback',
     'https://staging2.particulier.api.gouv.fr/auth/api_gouv_particulier/callback'
     ],
   ARRAY [
     'http://particulier.api.localtest.me:3000/compte/apres-deconnexion',
     'http://particulier.api.localtest.me:5000/compte/apres-deconnexion',
     'https://sandbox.particulier.api.gouv.fr/compte/apres-deconnexion',
     'https://sandbox1.particulier.api.gouv.fr/compte/apres-deconnexion',
     'https://sandbox2.particulier.api.gouv.fr/compte/apres-deconnexion',
     'https://staging.particulier.api.gouv.fr/compte/apres-deconnexion',
     'https://staging1.particulier.api.gouv.fr/compte/apres-deconnexion',
     'https://staging2.particulier.api.gouv.fr/compte/apres-deconnexion'
     ],
  'openid email',
   'http://particulier.api.localtest.me',
   'Bouquet de données proposé pour simplifier les démarches administratives.',
   null, null, null, null),
  (3,
   'API Entreprise',
   '4442bfd8caac8e19ff202d33060edcd248592662d5a8098e28b706ba906fe9e0db95ad336c38248f42896db272990b8dfc969d8b8857101dabf9b2ffe7ec49b9',
   'oauth_api_gouv_client_secret_entreprise',
   ARRAY [
     'http://entreprise.api.localtest.me:3000/auth/api_gouv_entreprise/callback',
     'http://entreprise.api.localtest.me:5000/auth/api_gouv_entreprise/callback',
     'https://sandbox.entreprise.api.gouv.fr/auth/api_gouv_entreprise/callback',
     'https://sandbox1.entreprise.api.gouv.fr/auth/api_gouv_entreprise/callback',
     'https://sandbox2.entreprise.api.gouv.fr/auth/api_gouv_entreprise/callback',
     'https://staging.entreprise.api.gouv.fr/auth/api_gouv_entreprise/callback',
     'https://staging1.entreprise.api.gouv.fr/auth/api_gouv_entreprise/callback',
     'https://staging2.entreprise.api.gouv.fr/auth/api_gouv_entreprise/callback'
     ],
   ARRAY [
     'http://entreprise.api.localtest.me:3000/compte/apres-deconnexion',
     'http://entreprise.api.localtest.me:5000/compte/apres-deconnexion',
     'https://sandbox.entreprise.api.gouv.fr/compte/apres-deconnexion',
     'https://sandbox1.entreprise.api.gouv.fr/compte/apres-deconnexion',
     'https://sandbox2.entreprise.api.gouv.fr/compte/apres-deconnexion',
     'https://staging.entreprise.api.gouv.fr/compte/apres-deconnexion',
     'https://staging1.entreprise.api.gouv.fr/compte/apres-deconnexion',
     'https://staging2.entreprise.api.gouv.fr/compte/apres-deconnexion'
     ],
  'openid email',
   'http://entreprise.api.localtest.me',
   'Permet aux entités administratives d’accéder aux données et aux documents administratifs des entreprises et des associations, afin de simplifier leurs démarches.',
   null, null, null, null),
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
   'openid email organization organizations',
   'https://grist.dev.incubateur.anct.gouv.fr',
   'Saisir et manipuler collaborativement les données.',
   null, null, null, null),
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
   'openid email profile organization',
   'http://localhost:3000/connexion/agent-public',
   'Accédez à l’espace agent public sur l’Annuaire des Entreprises.',
   null, null, null, null),
  (6,
   'Département de l’Aveyron – Authentification',
   'RWh9+Hyv1SGrUdt8+nKey8K6RbPn9GkXqitpTHKRKChSmfICA5fl9YIhKrUtkPtlfPl4oNhfsg56B4DH+/jsoaHwFjC+UKbWKwxgzjPWuzh4AG2er173fVq/U2TGxaXU',
   'lmB72ac+JKZPUmg3+vlo9dPMkCRnFRyz+NE+lslJFX07V4JObFZ0H/vXnXB5Jzu1s96KLU5FmirsfqsKLeVukHBO6Vmy6dfcwKfjMGgWTBD6ik01KUcFq2f3bx5nO6yj',
   ARRAY [
     'https://keycloak.lab.aveyron.fr/realms/MCP/broker/oidc/endpoint',
     'https://keycloak.lab.aveyron.fr/realms/MCP/broker/moncomptepro/endpoint',
     'https://keycloak.lab.aveyron.fr/realms/MCP/broker/moncomptepro-staging/endpoint'
     ],
   ARRAY [
     'https://keycloak.lab.aveyron.fr'
     ],
   'openid email profile organization organizations',
   'https://keycloak.lab.aveyron.fr',
   'Authentification des partenaires du Département de l’Aveyron.',
   null, null, null, null),
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
   'https://tous-a-bord.gouv.fr',
   'Vérifie l’éligibilité de bénéficiaires d’aides au transport',
   null, null, null, null),
  (8,
    'BaseProjectSIDDEE',
    'test_baseproject_SIDDEE',
    'test_baseproject_SIDDEEh#%!tbt#ux5)xr)e7z37%l(zu13w0cj0#2sxnx&6*wx$+zvl9n',
    ARRAY [
      'http://10.59.128.114:8001/oidc/callback/',
      'http://10.59.128.114:8001/auth/cb/',
      'http://10.59.128.114:8001/oidc/auth/cb/'
    ],
    ARRAY [
      'http://10.59.128.114:8001/'
    ],
    'openid email',
    'http://10.59.128.114:8001/',
    'Dépôt de demandes auprès du service IDDEE de la DREAL HdF',
   null, null, null, null),
  (9,
    'Annuaire des collectivités',
    'tdi1iyp2stw4w1ipl9hgye9qvfm9tbgi4cxu574rkwufkocux620r4c09tpm3apsav1rg7ex5j79w2vfsnrl1v4ewlkxrm45wtt9g8x3arsco1u86xeh9j4enus14vsi',
    'pqnu9wbs0h5pkbqeni2bx55mnvgxzta3d9wmu2h6yyxmf7303b5eapi4o4plue10bcj9n1iyoilbz07b2iokr4dcw3jsqitb7lc88n9cuxn9p9v0cqstfxgu82d392vn',
    ARRAY [
      'http://127.0.0.1:1337/api/oidc/callback/',
      'http://localhost:1337/api/oidc/callback/',
      'https://api.annuaire-des-collectivites.dev.incubateur.anct.gouv.fr/api/oidc/callback/'
    ],
    ARRAY [
      'http://127.0.0.1:1337/api/oidc/logout',
      'http://localhost:1337/api/oidc/logout',
      'https://api.annuaire-des-collectivites.dev.incubateur.anct.gouv.fr/api/oidc/logout'
    ],
    'openid email profile organization organizations',
    'https://annuaire-des-collectivites.dev.incubateur.anct.gouv.fr/',
    'Accès à l’interface d’administration de l’annuaire pour les agents des communes',
   null, null, null, null),
  (10,
    'data.gouv.fr',
    '277aa530830cac03a81a5670ec13d8677291658aa0b3138c733697c9915f4a2593d5faa968143f29e893aafb8a1ffba9593c52d46db13a27cf4d3fc3485ada90',
    'e25aa11f53f13a58e8c1fe022ddc0e07e240ec0c603f78535bf5ffd470c387be2e2edc348d6923fd718b989da08a40f241543d8c1e01bbaf88ad0ec84ed9140f',
    ARRAY [
      'http://dev.local:7000/fr/mcp/auth',
      'https://dev.data.gouv.fr/fr/mcp/auth',
      'https://demo.data.gouv.fr/fr/mcp/auth'
    ],
    ARRAY [
      'http://dev.local:7000/',
      'https://dev.data.gouv.fr/'
      ],
   'openid email profile',
    'https://dev.data.gouv.fr/',
    'Plateforme ouverte des données publiques françaises.',
   null, null, null, null),
  (11,
   'Oidc Test Client',
   'test-id',
   'test-secret',
   ARRAY [
     'http://localhost:9009/auth/callback'
     ],
   ARRAY []::varchar[],
   'openid email profile organization',
   'http://localhost:9009/',
   'This is a small, golang-based OIDC Client, to be used in End-to-end or other testing. More info: https://hub.docker.com/r/beryju/oidc-test-client.',
   null, null, null, null),
  (12,
   'Ma Cantine test',
   '7j0HTA411LSa1n4lO54gv6uMEWCey4RYwjnSQyUWcMQ7QM6SACLs8A1UTu4G0K831j4AqaZ3ZOHO98Agn5DGgjHx3J2n5F1YYEFZDmchqSv9ww1LLwXRMLJ7grT5Hl2D',
   'Jp0E7zVcoM7q1K74t372pU3aRk6uO5thM56A05mQHTXXVqCiDoTU9Bjru46DGvg4p4z3fwvQC5aXzgh7To14QskO35c92nw363tSEQHHlhfOVG16n7ZqSJ2FOattrYnD',
   ARRAY [
     'http://127.0.0.1:8000/signin-oidc',
     'https://ma-cantine-staging.cleverapps.io/signin-oidc',
     'https://ma-cantine-demo.cleverapps.io/signin-oidc'
     ],
   ARRAY [
     'http://127.0.0.1:8000/signout-callback-oidc',
     'https://ma-cantine-staging.cleverapps.io/signout-callback-oidc',
     'https://ma-cantine-demo.cleverapps.io/signout-callback-oidc'
     ],
   'openid email profile phone organization organizations',
   'https://ma-cantine-staging.cleverapps.io/',
   'Mieux manger de la crèche à l’EHPAD.',
   null, null, null, null),
  (13,
   'Egapro',
   'df292260603d69893ee7f732ac407cb014f658027616cb443401d411e53497790fedc72902ee9f9c4201c05cba9c0bbb97460e1f88351f68bff49df7c2b8ac39',
   '341b0d730ea54254d3a9a323f3adf3f431b3fe30c02bd2c62b32ccd8f6b2e9bb197eed03a2ff5e5e2be69d88ea1c60d6571cff37c488966f2f3c634c746ce2c2',
   ARRAY [
     'http://localhost:3000/api/auth/callback/moncomptepro',
     'http://localhost:3000/apiv2/auth/callback/moncomptepro',
     'http://localhost/api/auth/callback/moncomptepro',
     'http://localhost/apiv2/auth/callback/moncomptepro',
     'https://egapro-preprod.dev.fabrique.social.gouv.fr/api/auth/callback/moncomptepro',
     'https://egapro-preprod.dev.fabrique.social.gouv.fr/apiv2/auth/callback/moncomptepro',
     'https://egapro-master.dev.fabrique.social.gouv.fr/api/auth/callback/moncomptepro',
     'https://egapro-master.dev.fabrique.social.gouv.fr/apiv2/auth/callback/moncomptepro'
     ],
   ARRAY [
     'http://localhost:3000',
     'http://localhost',
     'https://egapro-preprod.dev.fabrique.social.gouv.fr',
     'https://egapro-master.dev.fabrique.social.gouv.fr'
     ],
   'openid email profile organization organizations',
   'https://egapro-preprod.dev.fabrique.social.gouv.fr/',
   'Egapro permet aux entreprises de mesurer, en toute transparence, les écarts de rémunération entre les sexes et de mettre en évidence leurs points de progression.',
   null, null, null, null),
  (14,
   'uMap - ANCT',
   'aiP2peephay1Ebu0VaZeNohqueeshaisee3wim5ageev8Chu3ohLiekeitataehoh3yohp8xuijeizamah9toS1aeW1cheif8obiubi6Phi3ahj0aeZ2ajaeko1uvon0',
   'eeXiet0WiengeiWuyuRailee6nie3ohdiefe5hoo6rai2ohx5iphie3seexeighai5shoo3foo5Ahwae8zaixiog1Shei4eer2beez3okoop0Cohwei7Chahkaih5ahx',
   ARRAY [
     'https://umap.dev.incubateur.anct.gouv.fr/complete/moncomptepro/',
     'http://localhost:8020/complete/moncomptepro/'
     ],
   ARRAY [
     'https://umap.dev.incubateur.anct.gouv.fr',
     'http://localhost:8020'
     ],
   'openid email profile organization',
   'https://umap.dev.incubateur.anct.gouv.fr',
   'Créer des cartes en ligne facilement.',
   null, null, null, null),
  (15,
   'AgentConnect',
   '36112b36ddcbe735b406c69e59f87fc5a96eed87923e42777f76f705c3a55e1e7a98a38a6e500640d4ce366124dc0a537cfaa967b6ef51fa99b2ca8edb8bff66',
   '85be6a293bfe2fa6ced0b246b83893a062635e577848bbbbb268da8ca0cc5844c2f5f2cbc8888891b4ac2b21a7599e47344c651a66d04f8cc34a454a5d0f1693',
   ARRAY [
     'https://fca.integ01.dev-agentconnect.fr/api/v2/oidc-callback'
   ],
   ARRAY [
     'https://fca.integ01.dev-agentconnect.fr/api/v2/client/logout-callback'
   ],
   'openid uid given_name usual_name email phone siret',
   'https://agentconnect.gouv.fr/',
   'Dispositif d’identification des agents de la fonction publique.',
   'ES256', 'ES256', 'ES256', 'ES256'),
  (16,
   'Stack Inclusion Numérique',
   'b6f7ff663b92f83002e1f6e55806dff017a2d39eae0bc04a39e44ff9d057cb1da0ac61c0c3b359e615133c6dc7beff455b15901965513d91c4eaeb39cfb7c3f3',
   '65e0e118a568fc955bff3812bac89cee081a93bcb4d296038d6507830451233dc184f0b6833f4e56d53073f318777a26e92fd2730513439214fbec4f9e7b0035',
   ARRAY [
     'http://localhost:3000/api/auth/callback/moncomptepro'
     ],
   ARRAY [
     'http://localhost:3000'
     ],
   'openid email profile organization',
   'http://localhost:3000',
   'Permettre une mise en ligne facile, rapide et respectant les critères de qualité de l’Incubateur des Territoires.',
   null, null, null, null),
  (17,
   'MiCoSIDDEE',
   'test_mico_SIDDEE',
   'test_mico_SIDDEEh#%!tbt#ux5)xr)e7z37%l(zu13w0cj0#2sxnx&6*wx$+zvl9n',
   ARRAY [
     'http://10.59.128.114:8004/oidc/callback/',
     'http://10.59.128.114:8004/auth/cb/',
     'http://10.59.128.114:8004/oidc/auth/cb/'
     ],
   ARRAY [
     'http://10.59.128.114:8004/'
     ],
   'openid email profile organization organizations',
   'http://10.59.128.114:8004/',
   'Développement d’une application pour le futur pôle à compétence nationale du SIDDEE à la DREAL HdF.',
   null, null, null, null),
  (18,
   'Tactick',
   'test_Tactick',
   'test_Tactickh#%!tbt#ux5)xr)e7z37%l(zu13w0cj0#2sxnx&6*wx$+zvl9n',
   ARRAY [
     'https://preprod.tactick.e2.rie.gouv.fr/oidc/callback/',
     'https://preprod.tactick.e2.rie.gouv.fr/auth/cb/',
     'https://preprod.tactick.e2.rie.gouv.fr/oidc/auth/cb/',
     'tactick-preprod-ihm-docker-rie.drealhdf-pre1.eco4.sihc.fr/oidc/callback/',
     'tactick-preprod-ihm-docker-rie.drealhdf-pre1.eco4.sihc.fr/auth/cb/',
     'tactick-preprod-ihm-docker-rie.drealhdf-pre1.eco4.sihc.fr/oidc/auth/cb/',
     'https://tactick-preprod-ihm-docker-rie.drealhdf-pre1.eco4.sihc.fr/oidc/callback/',
     'https://tactick-preprod-ihm-docker-rie.drealhdf-pre1.eco4.sihc.fr/auth/cb/',
     'https://tactick-preprod-ihm-docker-rie.drealhdf-pre1.eco4.sihc.fr/oidc/auth/cb/'
     ],
   ARRAY [
     'https://preprod.tactick.e2.rie.gouv.fr/',
     'tactick-preprod-ihm-docker-rie.drealhdf-pre1.eco4.sihc.fr/',
     'https://tactick-preprod-ihm-docker-rie.drealhdf-pre1.eco4.sihc.fr/'
     ],
   'openid email',
   'https://preprod.tactick.e2.rie.gouv.fr/',
   'Développement d’une application de dépôt de demandes à destination du SIDDEE de la DREAL HdF.',
   null, null, null, null),
  (19,
   'Outline - Opérateur',
   '3f9a230c90e72cf85aabd081d35e1567aedc6dac4d3be97b9514b2823c89544751a9901c78af22c2d0e5a4b75e35b893cdeb305cb217ae22984b47f610b4e14b',
   '8495eb74887ac74eaf4f21e5c3b80831adcc142c56655bed7ca2ec5c60930d675b8c2c777e6ad0a51bb9ce70d4de32d534c377087f2842c5a8d128a41358fa63',
   ARRAY [
     'https://documentation.beta.numerique.gouv.fr/auth/oidc.callback'
     ],
   ARRAY [
     'https://documentation.beta.numerique.gouv.fr/'
     ],
   'openid profile email',
   'https://documentation.beta.numerique.gouv.fr/',
   'La base de connaissances de votre équipe.',
   null, null, null, null),
  (20,
   'France Numerique Ensemble',
   '1e6a98e5eb16c65db76c9261f792b19f71157ac427605121eb301c00798ecafbda1ff5cb20bdda0fcc7e6792197e580212d649fb4700b98725f8918d2938fbbd',
   'e5431cbc7ad6936614ac5a5715d17f3ce5aeb8d3034561a9d425e1091c216239f0ee6f571d415d9c23d81d98b41fc0feaf1644dff96127f198b3193ecd72c875',
   ARRAY [
     'http://localhost:3000/api/auth/callback/moncomptepro',
     'https://dev.inclusion-numerique.anct.gouv.fr/api/auth/callback/moncomptepro'
     ],
   ARRAY []::varchar[],
   'openid email profile organization',
   'https://dev.inclusion-numerique.anct.gouv.fr',
   'Œuvrer Ensemble pour un Numérique Inclusif.',
   null, null, null, null)
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
