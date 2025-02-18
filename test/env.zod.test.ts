//

import { expect, test } from "vitest";
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

  expect(env).toMatchInlineSnapshot(`
    {
      "ACR_VALUE_FOR_CERTIFICATION_DIRIGEANT": "https://proconnect.gouv.fr/assurance/certification-dirigeant",
      "ACR_VALUE_FOR_IAL1_AAL1": "https://proconnect.gouv.fr/assurance/self-asserted",
      "ACR_VALUE_FOR_IAL1_AAL2": "https://proconnect.gouv.fr/assurance/self-asserted-2fa",
      "ACR_VALUE_FOR_IAL2_AAL1": "https://proconnect.gouv.fr/assurance/consistency-checked",
      "ACR_VALUE_FOR_IAL2_AAL2": "https://proconnect.gouv.fr/assurance/consistency-checked-2fa",
      "API_AUTH_PASSWORD": "admin",
      "API_AUTH_USERNAME": "admin",
      "APPLICATION_NAME": "ProConnect",
      "CRISP_BASE_URL": "https://api.crisp.chat",
      "CRISP_IDENTIFIER": "",
      "CRISP_KEY": "",
      "CRISP_MODERATION_TAG": [
        "identite",
        "moderation",
      ],
      "CRISP_PLUGIN_URN": "",
      "CRISP_RESOLVE_DELAY": 1000,
      "CRISP_USER_NICKNAME": "ProConnect",
      "CRISP_WEBSITE_ID": "",
      "DATABASE_URL": "postgres://moncomptepro:moncomptepro@127.0.0.1:5432/moncomptepro",
      "DEBOUNCE_API_KEY": "",
      "DEPLOY_ENV": "localhost",
      "DIRTY_DS_REDIRECTION_URL": "https://www.demarches-simplifiees.fr/agent_connect/logout_from_mcp",
      "EMAIL_DELIVERABILITY_WHITELIST": [],
      "FEATURE_ALWAYS_RETURN_EIDAS1_FOR_ACR": false,
      "FEATURE_AUTHENTICATE_BROWSER": false,
      "FEATURE_BYPASS_MODERATION": false,
      "FEATURE_CHECK_EMAIL_DELIVERABILITY": false,
      "FEATURE_CONSIDER_ALL_EMAIL_DOMAINS_AS_FREE": false,
      "FEATURE_CONSIDER_ALL_EMAIL_DOMAINS_AS_NON_FREE": true,
      "FEATURE_DISPLAY_TEST_ENV_WARNING": false,
      "FEATURE_RATE_LIMIT": false,
      "FEATURE_SEND_MAIL": false,
      "FEATURE_USE_ANNUAIRE_EMAILS": false,
      "FEATURE_USE_SECURE_COOKIES": false,
      "FEATURE_USE_SECURITY_RESPONSE_HEADERS": false,
      "HOST": "http://localhost:3000",
      "HTTP_CLIENT_TIMEOUT": 55000,
      "INSEE_CONSUMER_KEY": "fakesecret",
      "INSEE_CONSUMER_SECRET": "fakesecret",
      "JWKS": {
        "keys": [
          {
            "crv": "P-256",
            "d": "taURynSwshCfxEWs6z2_Xz-ocheg-6ePaU87cjy572Y",
            "kid": "GCirOyeBc0rlWhcbMnwe9FUadPk6ToJlOq3yvxvkKlE",
            "kty": "EC",
            "use": "enc",
            "x": "UtmbpHb1aHibmvEQJ2KlIzNro4tGfyMiBIVmO92YX7Q",
            "y": "YsRG_NMtLOqvA6S9zq5r7M9Y-Cgo4YwKvH3xXyvFE2E",
          },
          {
            "crv": "P-256",
            "d": "TLeCkidQUJG9s6hvHx8QSHNKfqyhcbIXCN7rJ67AjH4",
            "kid": "TeXJ6Hx4sG9A13LCFlU46-PYGopwwFOsmCTEJcwZvZ8",
            "kty": "EC",
            "use": "sig",
            "x": "2SSoeci15SnMM6wwxvNwzp_xjVTwgEALOY1NvTBbdqs",
            "y": "Gplus4XyX4dQ6Z0Pwb0UhsmJfx7S5_DCFxpK6yt396Q",
          },
          {
            "crv": "Ed25519",
            "d": "WxFz4Ulx6rLBO5HHHhg86BMc_CtRoCmFn8Gwy-kbaL4",
            "kid": "onHSTAw1rfQOz_qWnPTh2SZzrseoqbOOrD1tcxFOaIU",
            "kty": "OKP",
            "use": "sig",
            "x": "NQNM3isoJAeK6HWKEgHifRqFrC-R6ufusnv47BnlWn4",
          },
          {
            "d": "qClmBFjTiJgj2cMXmtvtLSnuVtMr-sFqVzZiEYiXAv7yXT3B0CEqdXf0unvVH2x3JTuhcies2Zf_0gQdhglpPro8YRx1v3l6N2HE1nmTj6reakWSlXNOdMthQ6KOzZxTHUA3J53aW1U0-nhW2TrQAYaTHgNSr-yOWMBFGWrxxomc8h_1OnnXS9wRxoicPshjx7S8huy3YLbWzQphBqzBx5vsPOClfbs0dtxhAY63vXbNDS_sAIVfn1U__f6ilFmzE9odgOydsSwBUtRm2Ir4wY5HhqYGRPOKAUNHLqEsDqwmp_o3RtBQwg937ymbOJvgoa6qkqg_uxtaVSP7RX4EKQ",
            "dp": "g0dYT3wQ4VRY8NFbwHci_2jBQzpOXgvLooEcMuJzP3TeITqoNQp8-qOuguiWs3caPAMk4g-wGH8zw5qhEStJtjBPzfw3MwKFAJ-tjgZvcUkhzaIUNmG9RZTUl3zcRurKYR7pdcETdfRT4nmHfkbgZV4uE0KZlP96ekoI7LUxqgk",
            "dq": "1Gpl81t_KVDgTu2OIoySo2nNBpUjzc7feKnzgsjaItALyrSkXD4COSElPPzY-vGa0fwWd483CRcyQeoSPKyGuf7wNVJ9XBV4kObqfh46cSgLp33axo3erPVpxwYubxO5olq00FW6Lr5D4kSclTX1pJ29LtoZDV7v1xJ_11vxydU",
            "e": "AQAB",
            "kid": "kddKa_IDmU8a5RhJaIzwzpJcFe4qT-GtNFcG2AWclZ4",
            "kty": "RSA",
            "n": "5yuakCQKnkzP4tNXYI6qRYX-0pyeuGKS8VKl7S1QNj7bAMjeV2o3xjDgg4qtrUrFrqxSFOfBX5kJR3NEBoYiQpUwl9zPmKNLR0zX0w6VpwDREDS8bpBL_naeiGRdLX_AYxR7jCsDETEXqFm0S1CmfLjgAoazLPDxzGvFaezLEo0rafcLR3MpKIa-INqwCoTiLWUAtXKv-ZcmO7QuzRcVJecFs7WaMQZNMrfSAdj-agdnVOkP2cXnd6xpT2Pcph7I6z2slRkEZ_Oz1BkG-FV_21IlY1U4tE3GigKdSNRSJmuyvdgI4wDb2noZdEStFr8nsOsG63kIYM_Gve-HWiTxmQ",
            "p": "-X7pv_NpfJvqTTlQwQnaz6eiA_I7v7Jj0l1KtmBRBZz6q6R9qq1BVlP8XeOBO5TX9vQKIooY8fL3QsWf73ZqQmmy9W3C4dAhwbwalvBzZHZT2Wznrurp_bML_8Xx1XhNxTawAb263O3AUz7Rw3g5lI2cafTe4x1dSO8_CHL3eMs",
            "q": "7TJj6aNzkVjyPeCZVHwBXGDWDIT2DxqWRjKrKgqlpWdzEftNce855Wg3Ve4JnNtFkg7Qow4imZVkbK69ChIStv9s1KDX_sGRCyfN17d0jlkyGUnFB2RSBB42t7SmcC4ZhHjxdAdopOG_o1r5vEwDo-0hKWikP9uyYmWyhfY3hqs",
            "qi": "4RyTKy-QINtOUezaLEymzNBIG3uZv_IKvGPhEYi4wRNP_XxIK9NwfgUFRAhxhpxSpEjco_eNuN3I6XBF7bXb4-Bnnye1mBm3sBTXx2_09r8zt9Uvg3cdh0pYem3hU1ANMRmr3rfjtain4DTskIJ2CxjvGIMyh3VXLyRyfzIGJig",
            "use": "enc",
          },
          {
            "d": "L0a7DDdP9LsAjeu_C6fkh4GXMqtRo3yPHK077SVFTPGGAFGq8Lk3C-wWTQxTwO9eZ_xx9wCzFTyIyqrksTuvQxzfY0MmzEk3mXNSrKxpK_vbgtC47qV6UwuGGiRfJ1z7MGXGmu5OmpaZqZJ-CPTGVtsM0rF4V665dIe-15o9GHzLX80mhw8ySd0qqBIbdIWlK2zaSRPGL08mP02t_XnHdCCaWfRE_erO6zsEhR8ePvbmQqI7GRBull59seXefo1VDP30lEwHwH05Ju24_ZddhfuP2Y9jkZnNKqpSHF3EZzT6Vh3ggAaLjQzRWJvd1_0Zit7CD06o6L1aLV7nDnTYAQ",
            "dp": "Cyf-4iwZZIrve5WsqKy8UVWpMBDCyBpCpHRNw2PAVGAP4aNXe2dG41sxV3mvdsOHWzqApsLT90EVHDa2KySS5CNcxOQ47Yr1mVVFoHb3izIcLe2dIpVUmgyc62WDcaShl47ahnWyDO8rLJzeH75AZlCaJR3s2nnth7Xy_cU4GQE",
            "dq": "SvJe21HfQe2JsqGwrBPg0ShcfKMnkQI3uaaDOJDkEyHJz4eILlETfiFEBgNRo4xYjPU4Aa2w81poYms4RhYdNwpB4DT5OXT8kL_KRykmhBLWaxafezyIRxdNs97h7eU1Vk_05C3vbG7fqASO6vv7HdHnB_ityGRDUnLbwKfDasU",
            "e": "AQAB",
            "kid": "lFWqEBQbScnjO5OzUbvkPp0rmjGy17bmzZOqUbWkQMo",
            "kty": "RSA",
            "n": "6btLS-c06m18O5BlLvJA4HJNVI7WauBg5JVoy1cHTdfjTJ-oSts5uetXKF_NlNcLuq-zIKZuu9wea5m2E3lJ-vtCSAtRaJgZY41KAOjIsrHQstVuc9di4zjgcA6zwEXhqwu48gklGKpWNk7wnfMCO6mNoRs_-8-CnK6lTFeJFzfoCDmS6dYbefmPeFW4qziEZzEv5DPGAcUsXXZhbOku_E8gILRVMkBwHpvY_G3jngE1EWXctiM9tYqhgvxyJC9QyPCVpgfAvDlslMpuQTxBviC9PsrcBaQ5PyAP_xNN3X8LB-STpz7jNpNquKL5Ls0Hv9R3fDCeHvcYoVsgDirwfQ",
            "p": "_u6v29kLICnGvbF44-sF5cFisrIPyXcj8laaNx6uP5ax9ZOPD_THdxTFU3YWLUErzi4MQJQPLoJacphQJKnG78b0PX_733--r-vpqUqfbzAlIssS8N4CFj6_YEMFR8W70laXJYJdx7IsnGOAlxAUZur5ugaaR0zDzlMTQVuR30E",
            "q": "6rXguomnHNGFslAeHWPxPDaHxihx3eRJ-8t1KyvvwT43YfdPn2xxdq5-TyO0MMKznvDIHk9HDMBMr8JH32Q9qx75Ec81NOLGkBWqO9x-8dBlKn95jr8-qkD3iXHmJiHHNWNurHJM4G4lo73IL_0jgo0CCpcZWP7iH5y-b_mXPj0",
            "qi": "QomRmnqrW3k8cV8MIefgmKZMGDGHRC44bFk9B20YR15_XHcMimi7o9rjUE7BY-RO30RsPUiQqB_vkpKvQZILOuPmIQhElcgmguKqPNwprVMgx-krUQ1Khuh3tgzxhBgazXzPcKmx8JBbCopP_UwNiCpPcdm74VFcZ-OswmqQU08",
            "use": "sig",
          },
        ],
      },
      "LOG_LEVEL": "info",
      "MAGIC_LINK_TOKEN_EXPIRATION_DURATION_IN_MINUTES": 60,
      "MAX_DURATION_BETWEEN_TWO_EMAIL_ADDRESS_VERIFICATION_IN_MINUTES": 129600,
      "MAX_SUGGESTED_ORGANIZATIONS": 3,
      "MIN_DURATION_BETWEEN_TWO_VERIFICATION_CODE_SENDING_IN_SECONDS": 1200,
      "NODE_ENV": "development",
      "PORT": 3000,
      "RECENT_LOGIN_INTERVAL_IN_SECONDS": 900,
      "REDIS_URL": "redis://:@127.0.0.1:6379",
      "RESET_PASSWORD_TOKEN_EXPIRATION_DURATION_IN_MINUTES": 60,
      "SENTRY_DSN": "",
      "SESSION_COOKIE_SECRET": [
        "proconnectsecret",
      ],
      "SESSION_MAX_AGE_IN_SECONDS": 86400,
      "SMTP_URL": "smtp://localhost:1025",
      "SYMMETRIC_ENCRYPTION_KEY": "aTrueRandom32BytesLongBase64EncodedStringAA=",
      "TEST_CONTACT_EMAIL": "mairie@yopmail.com",
      "TRUSTED_BROWSER_COOKIE_MAX_AGE_IN_SECONDS": 7776000,
      "VERIFY_EMAIL_TOKEN_EXPIRATION_DURATION_IN_MINUTES": 60,
    }
  `);
});
