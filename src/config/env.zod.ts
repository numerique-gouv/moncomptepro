import { z, type ZodTypeAny } from "zod";

//

export const apiEnvSchema = z.object({
  API_AUTH_PASSWORD: z.string().default("admin"),
  API_AUTH_USERNAME: z.string().default("admin"),
});

export const crispEnvSchema = z.object({
  CRISP_BASE_URL: z.string().url().default("https://api.crisp.chat"),
  CRISP_IDENTIFIER: z.string().default(""),
  CRISP_KEY: z.string().default(""),
  CRISP_PLUGIN_URN: z.string().default(""),
  CRISP_USER_NICKNAME: z.string().default("MonComptePro"),
  CRISP_WEBSITE_ID: z.string().default(""),
});

//

export const envSchema = z
  .object({
    ACCESS_LOG_PATH: z.string().optional(),
    BREVO_API_KEY: z.string().default(""),
    CONSIDER_ALL_EMAIL_DOMAINS_AS_FREE: zodTrueFalseBoolean().default("False"),
    CONSIDER_ALL_EMAIL_DOMAINS_AS_NON_FREE:
      zodTrueFalseBoolean().default("False"),
    DATABASE_URL: z.string().url(),
    DEBOUNCE_API_KEY: z.string().optional(),
    DEPLOY_ENV: z.enum(["preview", "production"]).default("preview"),
    DISABLE_SECURITY_RESPONSE_HEADERS: zodTrueFalseBoolean().default("False"),
    DISPLAY_TEST_ENV_WARNING: zodTrueFalseBoolean().default("False"),
    DO_NOT_AUTHENTICATE_BROWSER: zodTrueFalseBoolean().default("False"),
    DO_NOT_CHECK_EMAIL_DELIVERABILITY: zodTrueFalseBoolean().default("False"),
    DO_NOT_RATE_LIMIT: zodTrueFalseBoolean().default("False"),
    DO_NOT_SEND_MAIL: zodTrueFalseBoolean().default("False"),
    DO_NOT_USE_ANNUAIRE_EMAILS: zodTrueFalseBoolean().default("False"),
    EMAIL_DELIVERABILITY_WHITELIST: zCoerceArray(z.string()).default(""),
    ENABLE_FIXED_ACR: zodTrueFalseBoolean().default("False"),
    HTTP_CLIENT_TIMEOUT: z.coerce
      .number()
      .int()
      .nonnegative()
      .default(55 * 1_000), // 55 seconds in milliseconds;
    INSEE_CONSUMER_KEY: z.string(),
    INSEE_CONSUMER_SECRET: z.string(),
    JWKS: zCoerceJson().pipe(z.object({ keys: z.array(z.any()) })),
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
    MAX_SUGGESTED_ORGANIZATIONS: z.coerce
      .number()
      .int()
      .nonnegative()
      .default(3),
    MODERATION_TAG: z.string().default("moderation"),
    MONCOMPTEPRO_HOST: z.string().url().default("http://localhost:3000"),
    MONCOMPTEPRO_LABEL: z.string().default("MonComptePro"),
    NODE_ENV: z
      .enum(["production", "development", "test"])
      .default("development"),
    NOTIFY_ALL_MEMBER_LIMIT: z.coerce.number().int().nonnegative().default(50),
    PAIR_AUTHENTICATION_WHITELIST: zCoerceArray(z.string()).default(""),
    PORT: z.coerce.number().int().nonnegative().default(3000),
    RECENT_LOGIN_INTERVAL_IN_SECONDS: z.coerce
      .number()
      .int()
      .nonnegative()
      .default(15 * 60), // 15 minutes
    REDIS_URL: z.string().url().default("redis://:@127.0.0.1:6379"),
    RESET_PASSWORD_TOKEN_EXPIRATION_DURATION_IN_MINUTES: z.coerce
      .number()
      .int()
      .nonnegative()
      .default(60), // 1 hour in minutes
    SECURE_COOKIES: zodTrueFalseBoolean().default("True"),
    SENTRY_DSN: z.string().default(""),
    SESSION_COOKIE_SECRET: zCoerceArray(z.string()).default(""),
    SESSION_MAX_AGE_IN_SECONDS: z.coerce
      .number()
      .int()
      .nonnegative()
      .default(1 * 24 * 60 * 60), // 1 day in seconds
    SYMMETRIC_ENCRYPTION_KEY: z.string().base64({
      message:
        "The SYMMETRIC_ENCRYPTION_KEY environment variable should be 32 bytes long! Use crypto.randomBytes(32).toString('base64') to generate one.",
    }),
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
    ZAMMAD_TOKEN: z.string(),
    ZAMMAD_URL: z.string().url(),
  })
  .merge(apiEnvSchema)
  .merge(crispEnvSchema);

//
export function zodTrueFalseBoolean() {
  return z.enum(["True", "False"]).transform((v: string) => v === "True");
}

//

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
