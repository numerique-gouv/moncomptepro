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
  ACCESS_LOG_PATH,
  API_AUTH_PASSWORD,
  API_AUTH_USERNAME,
  ACR_VALUE_FOR_IAL1_AAL1,
  ACR_VALUE_FOR_IAL1_AAL2,
  ACR_VALUE_FOR_IAL2_AAL1,
  ACR_VALUE_FOR_IAL2_AAL2,
  ACR_VALUE_FOR_CERTIFICATION_DIRIGEANT,
  BREVO_API_KEY,
  CRISP_BASE_URL,
  CRISP_IDENTIFIER,
  CRISP_KEY,
  CRISP_MODERATION_TAG,
  CRISP_PLUGIN_URN,
  CRISP_RESOLVE_DELAY,
  CRISP_USER_NICKNAME,
  CRISP_WEBSITE_ID,
  DATABASE_URL,
  DEBOUNCE_API_KEY,
  DEPLOY_ENV,
  DIRTY_DS_REDIRECTION_URL,
  EMAIL_DELIVERABILITY_WHITELIST,
  FEATURE_ALWAYS_RETURN_EIDAS1_FOR_ACR,
  FEATURE_AUTHENTICATE_BROWSER,
  FEATURE_CHECK_EMAIL_DELIVERABILITY,
  FEATURE_CONSIDER_ALL_EMAIL_DOMAINS_AS_FREE,
  FEATURE_BYPASS_MODERATION,
  FEATURE_CONSIDER_ALL_EMAIL_DOMAINS_AS_NON_FREE,
  FEATURE_CONSIDER_ALL_USERS_AS_CERTIFIED,
  FEATURE_DISPLAY_TEST_ENV_WARNING,
  FEATURE_RATE_LIMIT,
  FEATURE_SEND_MAIL,
  FEATURE_USE_ANNUAIRE_EMAILS,
  FEATURE_USE_SECURE_COOKIES,
  FEATURE_USE_SECURITY_RESPONSE_HEADERS,
  FRANCECONNECT_CALLBACK_URL,
  FRANCECONNECT_CLIENT_ID,
  FRANCECONNECT_CLIENT_SECRET,
  FRANCECONNECT_ISSUER,
  FRANCECONNECT_SCOPES,
  FRANCECONNECT_VERIFICATION_MAX_AGE_IN_MINUTES,
  HTTP_CLIENT_TIMEOUT,
  INSEE_CONSUMER_KEY,
  INSEE_CONSUMER_SECRET,
  JWKS,
  LOG_LEVEL,
  MAGIC_LINK_TOKEN_EXPIRATION_DURATION_IN_MINUTES,
  MAX_DURATION_BETWEEN_TWO_EMAIL_ADDRESS_VERIFICATION_IN_MINUTES,
  MAX_SUGGESTED_ORGANIZATIONS,
  MIN_DURATION_BETWEEN_TWO_VERIFICATION_CODE_SENDING_IN_SECONDS,
  HOST,
  APPLICATION_NAME,
  NODE_ENV,
  PORT,
  RECENT_LOGIN_INTERVAL_IN_SECONDS,
  REDIS_URL,
  RESET_PASSWORD_TOKEN_EXPIRATION_DURATION_IN_MINUTES,
  SENTRY_DSN,
  SESSION_COOKIE_SECRET,
  SESSION_MAX_AGE_IN_SECONDS,
  SMTP_URL,
  SYMMETRIC_ENCRYPTION_KEY,
  TEST_CONTACT_EMAIL,
  TRUSTED_BROWSER_COOKIE_MAX_AGE_IN_SECONDS,
  VERIFY_EMAIL_TOKEN_EXPIRATION_DURATION_IN_MINUTES,
} = parsedEnv.data;

export const WEBSITE_IDENTIFIER = new URL(HOST).hostname;
