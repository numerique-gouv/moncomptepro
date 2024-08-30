//

import dotenv from "dotenv";
import { fromZodError } from "zod-validation-error";
import { envSchema } from "./env.zod";

// Load variable from .env.<NODE_ENV>.local file,
// Load variable from .env.local file,
// Load variable from .env.<NODE_ENV> file,
// Load variable from .env file
// only used in local dev env and test
dotenv.config({
  path: [
    `.env.${process.env["NODE_ENV"] ?? "development"}.local`,
    ".env.local",
    `.env.${process.env["NODE_ENV"] ?? "development"}`,
    ".env",
  ],
});

const parsedEnv = envSchema.safeParse(process.env, {
  path: ["process.env"],
});

if (!parsedEnv.success) throw fromZodError(parsedEnv.error, {});

export const {
  API_AUTH_PASSWORD,
  API_AUTH_USERNAME,
  BREVO_API_KEY,
  CONSIDER_ALL_EMAIL_DOMAINS_AS_FREE,
  CONSIDER_ALL_EMAIL_DOMAINS_AS_NON_FREE,
  CRISP_BASE_URL,
  CRISP_IDENTIFIER,
  CRISP_KEY,
  CRISP_PLUGIN_URN,
  CRISP_USER_NICKNAME,
  CRISP_WEBSITE_ID,
  DEBOUNCE_API_KEY,
  DEPLOY_ENV,
  DISABLE_SECURITY_RESPONSE_HEADERS,
  DISPLAY_TEST_ENV_WARNING,
  DO_NOT_AUTHENTICATE_BROWSER,
  DO_NOT_CHECK_EMAIL_DELIVERABILITY,
  DO_NOT_RATE_LIMIT,
  DO_NOT_SEND_MAIL,
  DO_NOT_USE_ANNUAIRE_EMAILS,
  EMAIL_DELIVERABILITY_WHITELIST,
  ENABLE_FIXED_ACR,
  HTTP_CLIENT_TIMEOUT,
  JWKS,
  LOG_LEVEL,
  MAGIC_LINK_TOKEN_EXPIRATION_DURATION_IN_MINUTES,
  MAX_DURATION_BETWEEN_TWO_EMAIL_ADDRESS_VERIFICATION_IN_MINUTES,
  MAX_SUGGESTED_ORGANIZATIONS,
  MODERATION_TAG,
  MONCOMPTEPRO_LABEL,
  NODE_ENV,
  NOTIFY_ALL_MEMBER_LIMIT,
  PAIR_AUTHENTICATION_WHITELIST,
  PORT,
  RECENT_LOGIN_INTERVAL_IN_SECONDS,
  REDIS_URL,
  RESET_PASSWORD_TOKEN_EXPIRATION_DURATION_IN_MINUTES,
  SECURE_COOKIES,
  SENTRY_DSN,
  SESSION_COOKIE_SECRET,
  SESSION_MAX_AGE_IN_SECONDS,
  SYMMETRIC_ENCRYPTION_KEY,
  TEST_CONTACT_EMAIL,
  TRUSTED_BROWSER_COOKIE_MAX_AGE_IN_SECONDS,
  VERIFY_EMAIL_TOKEN_EXPIRATION_DURATION_IN_MINUTES,
  ZAMMAD_TOKEN,
  ZAMMAD_URL,
} = parsedEnv.data;

export const {
  MONCOMPTEPRO_HOST = `http://localhost:${PORT}`,
  ACCESS_LOG_PATH,
  DATABASE_URL,
  INSEE_CONSUMER_KEY,
  INSEE_CONSUMER_SECRET,
} = process.env;

export const MONCOMPTEPRO_IDENTIFIER = new URL(MONCOMPTEPRO_HOST).hostname;
