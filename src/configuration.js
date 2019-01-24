import crypto from 'crypto';
import path from 'path';

import { findById } from './connectors/oidc-account-adapter';
import { render } from './services/utils';

const { OIDC_PAIRWISE_IDENTIFIER_SALT, SESSION_COOKIE_SECRET } = process.env;

export const cookiesSecrets = [SESSION_COOKIE_SECRET];
export const cookiesMaxAge = 1 * 24 * 60 * 60 * 1000; // 1 day in ms

export const provider = {
  acrValues: ['urn:mace:incommon:iap:bronze'],
  cookies: {
    names: {
      session: 'api_gouv_session',
      interaction: 'api_gouv_grant',
      resume: 'api_gouv_grant',
      state: 'api_gouv_state',
    },
    long: { signed: true, secure: true, maxAge: cookiesMaxAge },
    // triple the default value of short.maxAge as interaction may include a password forgot process which can be longer than 10 minutes
    short: { signed: true, secure: true, maxAge: 30 * 60 * 1000 }, // 30 minutes in ms,
    keys: cookiesSecrets,
  },
  claims: {
    amr: null,
    address: ['address'],
    email: ['email', 'email_verified'],
    phone: ['phone_number', 'phone_number_verified'],
    profile: [
      'birthdate',
      'family_name',
      'gender',
      'given_name',
      'locale',
      'middle_name',
      'name',
      'nickname',
      'picture',
      'preferred_username',
      'profile',
      'updated_at',
      'website',
      'zoneinfo',
    ],
    roles: ['roles', 'legacy_account_type'],
  },
  features: {
    devInteractions: false,
    discovery: false,
    encryption: true,
  },
  findById,
  formats: {
    default: 'opaque',
    AccessToken: 'jwt',
  },
  subjectTypes: ['public', 'pairwise'],
  pairwiseIdentifier(accountId, { sectorIdentifier }) {
    return crypto
      .createHash('sha256')
      .update(sectorIdentifier)
      .update(accountId)
      .update(OIDC_PAIRWISE_IDENTIFIER_SALT)
      .digest('hex');
  },
  interactionUrl: function interactionUrl(ctx, interaction) {
    // eslint-disable-line no-unused-vars
    return `/interaction/${ctx.oidc.uuid}`;
  },
  clientCacheDuration: 1 * 24 * 60 * 60, // 1 day in seconds,
  routes: {
    authorization: '/oauth/authorize',
    token: '/oauth/token',
    userinfo: '/oauth/userinfo',
  },
  renderError: async (ctx, { error, error_description }, err) => {
    console.error(err);

    const bodyHtml = await render(
      path.resolve(`${__dirname}/views/error.ejs`),
      {
        error_code: err.statusCode || err,
        error_message: `${error}: ${error_description}`,
      }
    );

    ctx.type = 'html';
    ctx.body = await render(path.resolve(`${__dirname}/views/_layout.ejs`), {
      body: bodyHtml,
    });
  },
};
