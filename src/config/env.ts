// load variable from .env file, only used in local dev env
import "dotenv/config";

export const {
  NODE_ENV,
  CRISP_BASE_URL = "https://api.crisp.chat",
  CRISP_IDENTIFIER,
  CRISP_KEY,
  CRISP_PLUGIN_URN,
  CRISP_USER_NICKNAME = "MonComptePro",
  CRISP_WEBSITE_ID,
  DEPLOY_ENV = "preview",
  PORT = 3000,
  MONCOMPTEPRO_HOST = `http://localhost:${PORT}`,
  SENTRY_DSN,
  ACCESS_LOG_PATH,
  DEBOUNCE_API_KEY,
  BREVO_API_KEY = "",
  TEST_CONTACT_EMAIL = "mairie@yopmail.com",
  DATABASE_URL,
  REDIS_URL = "redis://:@127.0.0.1:6379",
  INSEE_CONSUMER_KEY,
  INSEE_CONSUMER_SECRET,
  API_AUTH_USERNAME = "admin",
  API_AUTH_PASSWORD = "admin",
  ZAMMAD_TOKEN,
  ZAMMAD_URL,
  MODERATION_TAG = "moderation",
  // "trace" | "debug" | "info" | "warn" | "error" | "fatal"
  LOG_LEVEL = "info",
} = process.env;

if (!process.env.SYMMETRIC_ENCRYPTION_KEY) {
  throw new Error(
    "The SYMMETRIC_ENCRYPTION_KEY environment variable is not set!",
  );
} else if (
  Buffer.byteLength(process.env.SYMMETRIC_ENCRYPTION_KEY, "base64") !== 32
) {
  throw new Error(
    "The SYMMETRIC_ENCRYPTION_KEY environment variable should be 32 bytes long! Use crypto.randomBytes(32).toString('base64') to generate one.",
  );
}
export const SYMMETRIC_ENCRYPTION_KEY: string = process.env
  .SYMMETRIC_ENCRYPTION_KEY as string;

export const MONCOMPTEPRO_LABEL = "MonComptePro";
export const MONCOMPTEPRO_IDENTIFIER = new URL(MONCOMPTEPRO_HOST).hostname;

export const DO_NOT_CHECK_EMAIL_DELIVERABILITY =
  process.env.DO_NOT_CHECK_EMAIL_DELIVERABILITY === "True";
export const CONSIDER_ALL_EMAIL_DOMAINS_AS_FREE =
  process.env.CONSIDER_ALL_EMAIL_DOMAINS_AS_FREE === "True";
export const CONSIDER_ALL_EMAIL_DOMAINS_AS_NON_FREE =
  process.env.CONSIDER_ALL_EMAIL_DOMAINS_AS_NON_FREE === "True";
export const DO_NOT_SEND_MAIL = process.env.DO_NOT_SEND_MAIL === "True";
export const SECURE_COOKIES = (process.env.SECURE_COOKIES || "true") === "true";
export const DO_NOT_USE_ANNUAIRE_EMAILS =
  process.env.DO_NOT_USE_ANNUAIRE_EMAILS === "True";
export const DO_NOT_RATE_LIMIT = process.env.DO_NOT_RATE_LIMIT === "True";
export const DISPLAY_TEST_ENV_WARNING =
  process.env.DISPLAY_TEST_ENV_WARNING === "True";
export const DO_NOT_AUTHENTICATE_BROWSER =
  process.env.DO_NOT_AUTHENTICATE_BROWSER === "True";
export const DISABLE_SECURITY_RESPONSE_HEADERS =
  process.env.DISABLE_SECURITY_RESPONSE_HEADERS === "True";
export const ENABLE_FIXED_ACR = process.env.ENABLE_FIXED_ACR === "True";

const getNumberFromEnv = (name: string, defaultValue: number) => {
  const value = process.env[name];
  return value ? parseInt(value, 10) : defaultValue;
};
// we wait just enough to avoid nginx default timeout of 60 seconds
export const HTTP_CLIENT_TIMEOUT = getNumberFromEnv(
  "HTTP_CLIENT_TIMEOUT",
  55 * 1000, // 55 seconds in milliseconds;
);
export const SESSION_MAX_AGE_IN_SECONDS = getNumberFromEnv(
  "SESSION_MAX_AGE_IN_SECONDS",
  1 * 24 * 60 * 60, // 1 day in seconds
);
export const TRUSTED_BROWSER_COOKIE_MAX_AGE_IN_SECONDS = getNumberFromEnv(
  "TRUSTED_BROWSER_COOKIE_MAX_AGE_IN_SECONDS",
  3 * 30 * 24 * 60 * 60, // 3 months in seconds
);
export const RESET_PASSWORD_TOKEN_EXPIRATION_DURATION_IN_MINUTES =
  getNumberFromEnv("RESET_PASSWORD_TOKEN_EXPIRATION_DURATION_IN_MINUTES", 60);
export const VERIFY_EMAIL_TOKEN_EXPIRATION_DURATION_IN_MINUTES =
  getNumberFromEnv("VERIFY_EMAIL_TOKEN_EXPIRATION_DURATION_IN_MINUTES", 60);
export const MAGIC_LINK_TOKEN_EXPIRATION_DURATION_IN_MINUTES = getNumberFromEnv(
  "MAGIC_LINK_TOKEN_EXPIRATION_DURATION_IN_MINUTES",
  60,
);
export const MAX_DURATION_BETWEEN_TWO_EMAIL_ADDRESS_VERIFICATION_IN_MINUTES =
  getNumberFromEnv(
    "MAX_DURATION_BETWEEN_TWO_EMAIL_ADDRESS_VERIFICATION_IN_MINUTES",

    3 * 30 * 24 * 60, // 3 months in minutes
  );
export const NOTIFY_ALL_MEMBER_LIMIT = getNumberFromEnv(
  "NOTIFY_ALL_MEMBER_LIMIT",
  50,
);
export const RECENT_LOGIN_INTERVAL_IN_SECONDS = getNumberFromEnv(
  "RECENT_LOGIN_INTERVAL_IN_SECONDS",
  15 * 60, // 15 minutes
);
export const MAX_SUGGESTED_ORGANIZATIONS = getNumberFromEnv(
  "MAX_SUGGESTED_ORGANIZATIONS",
  3,
);

export const getArrayFromEnv = (name: string) => {
  const value = process.env[name];
  return value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item)
    : [];
};

export const EMAIL_DELIVERABILITY_WHITELIST = getArrayFromEnv(
  "EMAIL_DELIVERABILITY_WHITELIST",
);
export const PAIR_AUTHENTICATION_WHITELIST = getArrayFromEnv(
  "PAIR_AUTHENTICATION_WHITELIST",
);
export const SESSION_COOKIE_SECRET = getArrayFromEnv("SESSION_COOKIE_SECRET");

export const getJSONFromEnv = (name: string) => {
  const value = process.env[name];
  return value ? JSON.parse(value) : {};
};

export const JWKS = getJSONFromEnv("JWKS");
