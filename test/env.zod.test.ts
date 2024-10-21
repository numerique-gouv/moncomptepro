//

import { expect } from "chai";
import { test } from "mocha";
import { defaultJWKS } from "../src/config/default-jwks";
import { envSchema } from "../src/config/env.zod";

//

test("default sample env with configured INSEE secrets", () => {
  const sample_env = {
    DATABASE_URL:
      "postgres://moncomptepro:moncomptepro@127.0.0.1:5432/moncomptepro",
    INSEE_CONSUMER_KEY: "fakesecret",
    INSEE_CONSUMER_SECRET: "fakesecret",
  };

  const env = envSchema.parse(sample_env);

  expect(env).to.deep.equal({
    ACR_VALUE_FOR_IAL1_AAL1:
      "https://proconnect.gouv.fr/assurance/self-asserted",
    ACR_VALUE_FOR_IAL1_AAL2:
      "https://proconnect.gouv.fr/assurance/self-asserted-2fa",
    ACR_VALUE_FOR_IAL2_AAL1:
      "https://proconnect.gouv.fr/assurance/consistency-checked",
    ACR_VALUE_FOR_IAL2_AAL2:
      "https://proconnect.gouv.fr/assurance/consistency-checked-2fa",
    API_AUTH_PASSWORD: "admin",
    API_AUTH_USERNAME: "admin",
    CRISP_BASE_URL: "https://api.crisp.chat",
    CRISP_IDENTIFIER: "",
    CRISP_KEY: "",
    CRISP_PLUGIN_URN: "",
    CRISP_RESOLVE_DELAY: 1000,
    CRISP_USER_NICKNAME: "MonComptePro",
    CRISP_WEBSITE_ID: "",
    DATABASE_URL:
      "postgres://moncomptepro:moncomptepro@127.0.0.1:5432/moncomptepro",
    DEPLOY_ENV: "preview",
    DIRTY_DS_REDIRECTION_URL:
      "https://www.demarches-simplifiees.fr/agent_connect/logout_from_mcp",
    EMAIL_DELIVERABILITY_WHITELIST: [],
    FEATURE_ALWAYS_RETURN_EIDAS1_FOR_ACR: false,
    FEATURE_AUTHENTICATE_BROWSER: false,
    FEATURE_CHECK_EMAIL_DELIVERABILITY: false,
    FEATURE_CONSIDER_ALL_EMAIL_DOMAINS_AS_FREE: false,
    FEATURE_CONSIDER_ALL_EMAIL_DOMAINS_AS_NON_FREE: true,
    FEATURE_DISPLAY_TEST_ENV_WARNING: false,
    FEATURE_RATE_LIMIT: false,
    FEATURE_SEND_MAIL: false,
    FEATURE_USE_ANNUAIRE_EMAILS: false,
    FEATURE_USE_SECURE_COOKIES: false,
    FEATURE_USE_SECURITY_RESPONSE_HEADERS: false,
    HTTP_CLIENT_TIMEOUT: 55000,
    INSEE_CONSUMER_KEY: "fakesecret",
    INSEE_CONSUMER_SECRET: "fakesecret",
    JWKS: defaultJWKS,
    LOG_LEVEL: "info",
    MAGIC_LINK_TOKEN_EXPIRATION_DURATION_IN_MINUTES: 60,
    MAX_DURATION_BETWEEN_TWO_EMAIL_ADDRESS_VERIFICATION_IN_MINUTES: 129600,
    MAX_SUGGESTED_ORGANIZATIONS: 3,
    MONCOMPTEPRO_HOST: "http://localhost:3000",
    MONCOMPTEPRO_LABEL: "MonComptePro",
    NODE_ENV: "development",
    PORT: 3000,
    RECENT_LOGIN_INTERVAL_IN_SECONDS: 900,
    REDIS_URL: "redis://:@127.0.0.1:6379",
    RESET_PASSWORD_TOKEN_EXPIRATION_DURATION_IN_MINUTES: 60,
    SENTRY_DSN: "",
    SESSION_COOKIE_SECRET: ["moncompteprosecret"],
    SESSION_MAX_AGE_IN_SECONDS: 86400,
    SYMMETRIC_ENCRYPTION_KEY: "aTrueRandom32BytesLongBase64EncodedStringAA=",
    TEST_CONTACT_EMAIL: "mairie@yopmail.com",
    TRUSTED_BROWSER_COOKIE_MAX_AGE_IN_SECONDS: 7776000,
    VERIFY_EMAIL_TOKEN_EXPIRATION_DURATION_IN_MINUTES: 60,
  });
});
