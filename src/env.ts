export const {
  PORT = 3000,
  MONCOMPTEPRO_HOST = `http://localhost:${PORT}`,
  JWKS_PATH = `${__dirname}/../jwks.json`,
  SESSION_COOKIE_SECRET = '',
  SENTRY_DSN,
  ACCESS_LOG_PATH,
  DEBOUNCE_API_KEY,
  SENDINBLUE_API_KEY = '',
  TEST_CONTACT_EMAIL = 'mairie@yopmail.com',
  DATABASE_URL,
  REDIS_URL = 'redis://:@127.0.0.1:6379',
  INSEE_CONSUMER_KEY,
  INSEE_CONSUMER_SECRET,
  SUPPORT_EMAIL_ADDRESS = 'moncomptepro@beta.gouv.fr',
  API_AUTH_USERNAME = 'admin',
  API_AUTH_PASSWORD = 'admin',
  BETA_TESTING_ORGANISATIONS_FOR_SPONSORSHIP = '13002526500013,13002603200016',
} = process.env;

export const DO_NOT_VALIDATE_MAIL = process.env.DO_NOT_VALIDATE_MAIL === 'True';
export const CONSIDER_ALL_EMAIL_DOMAINS_AS_FREE =
  process.env.CONSIDER_ALL_EMAIL_DOMAINS_AS_FREE === 'True';
export const DO_NOT_SEND_MAIL = process.env.DO_NOT_SEND_MAIL === 'True';
export const SECURE_COOKIES = (process.env.SECURE_COOKIES || 'true') === 'true';
export const DO_NOT_USE_ANNUAIRE_EMAILS =
  process.env.DO_NOT_USE_ANNUAIRE_EMAILS === 'True';
export const DO_NOT_RATE_LIMIT = process.env.DO_NOT_RATE_LIMIT === 'True';

// we wait just enough to avoid nginx default timeout of 60 seconds
export const HTTP_CLIENT_TIMEOUT = 55 * 1000; // 55 seconds in milliseconds;
