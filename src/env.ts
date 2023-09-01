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
} = process.env;

export const DO_NOT_VALIDATE_MAIL = process.env.DO_NOT_VALIDATE_MAIL === 'True';
export const CONSIDER_ALL_EMAIL_DOMAINS_AS_FREE =
  process.env.CONSIDER_ALL_EMAIL_DOMAINS_AS_FREE === 'True';
export const DO_NOT_SEND_MAIL = process.env.DO_NOT_SEND_MAIL === 'True';
export const SECURE_COOKIES = (process.env.SECURE_COOKIES || 'true') === 'true';
export const DO_NOT_USE_ANNUAIRE_EMAILS =
  process.env.DO_NOT_USE_ANNUAIRE_EMAILS === 'True';
export const DO_NOT_RATE_LIMIT = process.env.DO_NOT_RATE_LIMIT === 'True';
export const DISPLAY_TEST_ENV_WARNING =
  process.env.DISPLAY_TEST_ENV_WARNING === 'True';

// we wait just enough to avoid nginx default timeout of 60 seconds
export const HTTP_CLIENT_TIMEOUT = 55 * 1000; // 55 seconds in milliseconds;
export const SESSION_MAX_AGE_IN_SECONDS = process.env.SESSION_MAX_AGE_IN_SECONDS
  ? parseInt(process.env.SESSION_MAX_AGE_IN_SECONDS, 10)
  : 1 * 24 * 60 * 60; // 1 day in seconds
export const RESET_PASSWORD_TOKEN_EXPIRATION_DURATION_IN_MINUTES = 60;
export const VERIFY_EMAIL_TOKEN_EXPIRATION_DURATION_IN_MINUTES = 60;
export const MAGIC_LINK_TOKEN_EXPIRATION_DURATION_IN_MINUTES = 10;
export const MAX_DURATION_BETWEEN_TWO_EMAIL_ADDRESS_VERIFICATION_IN_MINUTES =
  3 * 30 * 24 * 60;
