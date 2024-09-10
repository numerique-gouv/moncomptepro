import { z, type ZodTypeAny } from "zod";

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
    .default(
      '{"keys":[{"crv":"P-256","x":"UtmbpHb1aHibmvEQJ2KlIzNro4tGfyMiBIVmO92YX7Q","y":"YsRG_NMtLOqvA6S9zq5r7M9Y-Cgo4YwKvH3xXyvFE2E","d":"taURynSwshCfxEWs6z2_Xz-ocheg-6ePaU87cjy572Y","kty":"EC","kid":"GCirOyeBc0rlWhcbMnwe9FUadPk6ToJlOq3yvxvkKlE","use":"enc"},{"crv":"P-256","x":"2SSoeci15SnMM6wwxvNwzp_xjVTwgEALOY1NvTBbdqs","y":"Gplus4XyX4dQ6Z0Pwb0UhsmJfx7S5_DCFxpK6yt396Q","d":"TLeCkidQUJG9s6hvHx8QSHNKfqyhcbIXCN7rJ67AjH4","kty":"EC","kid":"TeXJ6Hx4sG9A13LCFlU46-PYGopwwFOsmCTEJcwZvZ8","use":"sig"},{"crv":"Ed25519","x":"NQNM3isoJAeK6HWKEgHifRqFrC-R6ufusnv47BnlWn4","d":"WxFz4Ulx6rLBO5HHHhg86BMc_CtRoCmFn8Gwy-kbaL4","kty":"OKP","kid":"onHSTAw1rfQOz_qWnPTh2SZzrseoqbOOrD1tcxFOaIU","use":"sig"},{"e":"AQAB","n":"5yuakCQKnkzP4tNXYI6qRYX-0pyeuGKS8VKl7S1QNj7bAMjeV2o3xjDgg4qtrUrFrqxSFOfBX5kJR3NEBoYiQpUwl9zPmKNLR0zX0w6VpwDREDS8bpBL_naeiGRdLX_AYxR7jCsDETEXqFm0S1CmfLjgAoazLPDxzGvFaezLEo0rafcLR3MpKIa-INqwCoTiLWUAtXKv-ZcmO7QuzRcVJecFs7WaMQZNMrfSAdj-agdnVOkP2cXnd6xpT2Pcph7I6z2slRkEZ_Oz1BkG-FV_21IlY1U4tE3GigKdSNRSJmuyvdgI4wDb2noZdEStFr8nsOsG63kIYM_Gve-HWiTxmQ","d":"qClmBFjTiJgj2cMXmtvtLSnuVtMr-sFqVzZiEYiXAv7yXT3B0CEqdXf0unvVH2x3JTuhcies2Zf_0gQdhglpPro8YRx1v3l6N2HE1nmTj6reakWSlXNOdMthQ6KOzZxTHUA3J53aW1U0-nhW2TrQAYaTHgNSr-yOWMBFGWrxxomc8h_1OnnXS9wRxoicPshjx7S8huy3YLbWzQphBqzBx5vsPOClfbs0dtxhAY63vXbNDS_sAIVfn1U__f6ilFmzE9odgOydsSwBUtRm2Ir4wY5HhqYGRPOKAUNHLqEsDqwmp_o3RtBQwg937ymbOJvgoa6qkqg_uxtaVSP7RX4EKQ","p":"-X7pv_NpfJvqTTlQwQnaz6eiA_I7v7Jj0l1KtmBRBZz6q6R9qq1BVlP8XeOBO5TX9vQKIooY8fL3QsWf73ZqQmmy9W3C4dAhwbwalvBzZHZT2Wznrurp_bML_8Xx1XhNxTawAb263O3AUz7Rw3g5lI2cafTe4x1dSO8_CHL3eMs","q":"7TJj6aNzkVjyPeCZVHwBXGDWDIT2DxqWRjKrKgqlpWdzEftNce855Wg3Ve4JnNtFkg7Qow4imZVkbK69ChIStv9s1KDX_sGRCyfN17d0jlkyGUnFB2RSBB42t7SmcC4ZhHjxdAdopOG_o1r5vEwDo-0hKWikP9uyYmWyhfY3hqs","dp":"g0dYT3wQ4VRY8NFbwHci_2jBQzpOXgvLooEcMuJzP3TeITqoNQp8-qOuguiWs3caPAMk4g-wGH8zw5qhEStJtjBPzfw3MwKFAJ-tjgZvcUkhzaIUNmG9RZTUl3zcRurKYR7pdcETdfRT4nmHfkbgZV4uE0KZlP96ekoI7LUxqgk","dq":"1Gpl81t_KVDgTu2OIoySo2nNBpUjzc7feKnzgsjaItALyrSkXD4COSElPPzY-vGa0fwWd483CRcyQeoSPKyGuf7wNVJ9XBV4kObqfh46cSgLp33axo3erPVpxwYubxO5olq00FW6Lr5D4kSclTX1pJ29LtoZDV7v1xJ_11vxydU","qi":"4RyTKy-QINtOUezaLEymzNBIG3uZv_IKvGPhEYi4wRNP_XxIK9NwfgUFRAhxhpxSpEjco_eNuN3I6XBF7bXb4-Bnnye1mBm3sBTXx2_09r8zt9Uvg3cdh0pYem3hU1ANMRmr3rfjtain4DTskIJ2CxjvGIMyh3VXLyRyfzIGJig","kty":"RSA","kid":"kddKa_IDmU8a5RhJaIzwzpJcFe4qT-GtNFcG2AWclZ4","use":"enc"},{"e":"AQAB","n":"6btLS-c06m18O5BlLvJA4HJNVI7WauBg5JVoy1cHTdfjTJ-oSts5uetXKF_NlNcLuq-zIKZuu9wea5m2E3lJ-vtCSAtRaJgZY41KAOjIsrHQstVuc9di4zjgcA6zwEXhqwu48gklGKpWNk7wnfMCO6mNoRs_-8-CnK6lTFeJFzfoCDmS6dYbefmPeFW4qziEZzEv5DPGAcUsXXZhbOku_E8gILRVMkBwHpvY_G3jngE1EWXctiM9tYqhgvxyJC9QyPCVpgfAvDlslMpuQTxBviC9PsrcBaQ5PyAP_xNN3X8LB-STpz7jNpNquKL5Ls0Hv9R3fDCeHvcYoVsgDirwfQ","d":"L0a7DDdP9LsAjeu_C6fkh4GXMqtRo3yPHK077SVFTPGGAFGq8Lk3C-wWTQxTwO9eZ_xx9wCzFTyIyqrksTuvQxzfY0MmzEk3mXNSrKxpK_vbgtC47qV6UwuGGiRfJ1z7MGXGmu5OmpaZqZJ-CPTGVtsM0rF4V665dIe-15o9GHzLX80mhw8ySd0qqBIbdIWlK2zaSRPGL08mP02t_XnHdCCaWfRE_erO6zsEhR8ePvbmQqI7GRBull59seXefo1VDP30lEwHwH05Ju24_ZddhfuP2Y9jkZnNKqpSHF3EZzT6Vh3ggAaLjQzRWJvd1_0Zit7CD06o6L1aLV7nDnTYAQ","p":"_u6v29kLICnGvbF44-sF5cFisrIPyXcj8laaNx6uP5ax9ZOPD_THdxTFU3YWLUErzi4MQJQPLoJacphQJKnG78b0PX_733--r-vpqUqfbzAlIssS8N4CFj6_YEMFR8W70laXJYJdx7IsnGOAlxAUZur5ugaaR0zDzlMTQVuR30E","q":"6rXguomnHNGFslAeHWPxPDaHxihx3eRJ-8t1KyvvwT43YfdPn2xxdq5-TyO0MMKznvDIHk9HDMBMr8JH32Q9qx75Ec81NOLGkBWqO9x-8dBlKn95jr8-qkD3iXHmJiHHNWNurHJM4G4lo73IL_0jgo0CCpcZWP7iH5y-b_mXPj0","dp":"Cyf-4iwZZIrve5WsqKy8UVWpMBDCyBpCpHRNw2PAVGAP4aNXe2dG41sxV3mvdsOHWzqApsLT90EVHDa2KySS5CNcxOQ47Yr1mVVFoHb3izIcLe2dIpVUmgyc62WDcaShl47ahnWyDO8rLJzeH75AZlCaJR3s2nnth7Xy_cU4GQE","dq":"SvJe21HfQe2JsqGwrBPg0ShcfKMnkQI3uaaDOJDkEyHJz4eILlETfiFEBgNRo4xYjPU4Aa2w81poYms4RhYdNwpB4DT5OXT8kL_KRykmhBLWaxafezyIRxdNs97h7eU1Vk_05C3vbG7fqASO6vv7HdHnB_ityGRDUnLbwKfDasU","qi":"QomRmnqrW3k8cV8MIefgmKZMGDGHRC44bFk9B20YR15_XHcMimi7o9rjUE7BY-RO30RsPUiQqB_vkpKvQZILOuPmIQhElcgmguKqPNwprVMgx-krUQ1Khuh3tgzxhBgazXzPcKmx8JBbCopP_UwNiCpPcdm74VFcZ-OswmqQU08","kty":"RSA","kid":"lFWqEBQbScnjO5OzUbvkPp0rmjGy17bmzZOqUbWkQMo","use":"sig"}]}',
    )
    .pipe(z.object({ keys: z.array(z.any()) })),
});

export const paramsEnvSchema = z.object({
  ACCESS_LOG_PATH: z.string().optional(),
  DEPLOY_ENV: z.enum(["preview", "production", "sandbox"]).default("preview"),
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
