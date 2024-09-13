import { z, type ZodTypeAny } from "zod";
import { defaultJWKS } from "./default-jwks";

export const emailEnvSchema = z.object({
  BREVO_API_KEY: z.string().optional(),
  DO_NOT_SEND_MAIL: zodTrueFalseBoolean().default("True"),
  ZAMMAD_TOKEN: z.string().optional(),
  ZAMMAD_URL: z.string().url().default("https://support.etalab.gouv.fr"),
});

export const connectorEnvSchema = z.object({
  API_AUTH_PASSWORD: z.string().default("admin"),
  API_AUTH_USERNAME: z.string().default("admin"),
  CRISP_BASE_URL: z.string().url().default("https://api.crisp.chat"),
  CRISP_IDENTIFIER: z.string().default(""),
  CRISP_KEY: z.string().default(""),
  CRISP_PLUGIN_URN: z.string().default(""),
  CRISP_RESOLVE_DELAY: z.coerce.number().int().nonnegative().default(1_000), // 1 second
  CRISP_USER_NICKNAME: z.string().default("MonComptePro"),
  CRISP_WEBSITE_ID: z.string().default(""),
  DATABASE_URL: z.string().url(),
  DEBOUNCE_API_KEY: z.string().optional(),
  INSEE_CONSUMER_KEY: z.string(),
  INSEE_CONSUMER_SECRET: z.string(),
  REDIS_URL: z.string().url().default("redis://:@127.0.0.1:6379"),
  SENTRY_DSN: z.string().default(""),
});

export const featureTogglesEnvSchema = z.object({
  CONSIDER_ALL_EMAIL_DOMAINS_AS_FREE: zodTrueFalseBoolean().default("False"),
  CONSIDER_ALL_EMAIL_DOMAINS_AS_NON_FREE: zodTrueFalseBoolean().default("True"),
  DISABLE_SECURITY_RESPONSE_HEADERS: zodTrueFalseBoolean().default("True"),
  DISPLAY_TEST_ENV_WARNING: zodTrueFalseBoolean().default("False"),
  DO_NOT_AUTHENTICATE_BROWSER: zodTrueFalseBoolean().default("True"),
  DO_NOT_CHECK_EMAIL_DELIVERABILITY: zodTrueFalseBoolean().default("True"),
  DO_NOT_RATE_LIMIT: zodTrueFalseBoolean().default("True"),
  DO_NOT_USE_ANNUAIRE_EMAILS: zodTrueFalseBoolean().default("True"),
  SECURE_COOKIES: zodTrueFalseBoolean().default("False"),
  ENABLE_FIXED_ACR: zodTrueFalseBoolean().default("False"),
});

export const secretEnvSchema = z.object({
  SYMMETRIC_ENCRYPTION_KEY: z
    .string()
    .base64({
      message:
        "The SYMMETRIC_ENCRYPTION_KEY environment variable should be 32 bytes long! Use crypto.randomBytes(32).toString('base64') to generate one.",
    })
    .default("aTrueRandom32BytesLongBase64EncodedStringAA="),
  SESSION_COOKIE_SECRET: zCoerceArray(z.string()).default("moncompteprosecret"),
  JWKS: zCoerceJson()
    .default(JSON.stringify(defaultJWKS))
    .pipe(z.object({ keys: z.array(z.any()) })),
});

export const paramsEnvSchema = z.object({
  ACCESS_LOG_PATH: z.string().optional(),
  DEPLOY_ENV: z.enum(["preview", "production", "sandbox"]).default("preview"),
  DIRTY_DS_REDIRECTION_URL: z
    .string()
    .url()
    .optional()
    .default(
      "https://www.demarches-simplifiees.fr/agent_connect/logout_from_mcp",
    ),
  EMAIL_DELIVERABILITY_WHITELIST: zCoerceArray(z.string()).default(""),
  HTTP_CLIENT_TIMEOUT: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(55 * 1_000), // 55 seconds in milliseconds;
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal"])
    .default("info"),
  MAGIC_LINK_TOKEN_EXPIRATION_DURATION_IN_MINUTES: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(60), // 1 hour in minutes
  MAX_DURATION_BETWEEN_TWO_EMAIL_ADDRESS_VERIFICATION_IN_MINUTES: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(3 * 30 * 24 * 60), // 3 months in minutes
  MAX_SUGGESTED_ORGANIZATIONS: z.coerce.number().int().nonnegative().default(3),
  MODERATION_TAG: z.string().default("github-action-e2e-test"),
  MONCOMPTEPRO_HOST: z.string().url().default("http://localhost:3000"),
  MONCOMPTEPRO_LABEL: z.string().default("MonComptePro"),
  NODE_ENV: z
    .enum(["production", "development", "test"])
    .default("development"),
  PORT: z.coerce.number().int().nonnegative().default(3000),
  RECENT_LOGIN_INTERVAL_IN_SECONDS: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(15 * 60), // 15 minutes
  RESET_PASSWORD_TOKEN_EXPIRATION_DURATION_IN_MINUTES: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(60), // 1 hour in minutes
  SESSION_MAX_AGE_IN_SECONDS: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(1 * 24 * 60 * 60), // 1 day in seconds
  TEST_CONTACT_EMAIL: z.string().default("mairie@yopmail.com"),
  TRUSTED_BROWSER_COOKIE_MAX_AGE_IN_SECONDS: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(3 * 30 * 24 * 60 * 60), // 3 months in seconds
  VERIFY_EMAIL_TOKEN_EXPIRATION_DURATION_IN_MINUTES: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(60), // 1 hour in minutes
});

export const envSchema = z
  .object({})
  .merge(emailEnvSchema)
  .merge(connectorEnvSchema)
  .merge(featureTogglesEnvSchema)
  .merge(secretEnvSchema)
  .merge(paramsEnvSchema);

//

export function zodTrueFalseBoolean() {
  return z.enum(["True", "False"]).transform((v: string) => v === "True");
}

export function zCoerceArray<T extends ZodTypeAny>(schema: T) {
  return z
    .string()
    .transform((value) => (value === "" ? [] : value.split(",")))
    .pipe(z.array(schema));
}

export function zCoerceJson() {
  return z.string().transform((str, ctx) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      ctx.addIssue({ code: "custom", message: "Invalid JSON" });
      return z.NEVER;
    }
  });
}
