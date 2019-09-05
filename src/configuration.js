import crypto from 'crypto';

import { findAccount } from './connectors/oidc-account-adapter';
import { renderWithEjsLayout } from './services/utils';

const { OIDC_PAIRWISE_IDENTIFIER_SALT, SESSION_COOKIE_SECRET } = process.env;

export const cookiesSecrets = [SESSION_COOKIE_SECRET];
export const cookiesMaxAge = 1 * 24 * 60 * 60 * 1000; // 1 day in ms

export const provider = {
  acrValues: ['urn:mace:incommon:iap:bronze'],
  cookies: {
    names: {
      session: 'api_gouv_session',
      interaction: 'api_gouv_interaction',
      resume: 'api_gouv_interaction_resume',
      state: 'api_gouv_state',
    },
    long: { signed: true, secure: true, maxAge: cookiesMaxAge },
    // triple the default value of short.maxAge as interaction may include a password forgot process which can be longer than 10 minutes
    // This parameter set the session duration on signup.
    // On api-particulier-auth, it his the duration the session will remain open after the last activity.
    // Also related to https://github.com/panva/node-oidc-provider/issues/382.
    short: { signed: true, secure: true, maxAge: 3 * 60 * 60 * 1000 }, // 3 hours in ms,
    keys: cookiesSecrets,
  },
  claims: {
    amr: null,
    address: ['address'],
    email: ['email', 'email_verified'],
    profile: ['family_name', 'given_name', 'updated_at'],
    organizations: ['organizations'],
    roles: ['roles'],
  },
  features: {
    devInteractions: { enabled: false },
    frontchannelLogout: { enabled: true },
    encryption: { enabled: true },
  },
  findAccount,
  formats: {
    AccessToken: 'jwt',
  },
  subjectTypes: ['public', 'pairwise'],
  pairwiseIdentifier(ctx, accountId, { sectorIdentifier }) {
    return crypto
      .createHash('sha256')
      .update(sectorIdentifier)
      .update(accountId)
      .update(OIDC_PAIRWISE_IDENTIFIER_SALT)
      .digest('hex');
  },
  logoutSource: async (ctx, form) => {
    const xsrfToken = /name="xsrf" value="([a-f0-9]*)"/.exec(form)[1];

    ctx.type = 'html';
    ctx.body = await renderWithEjsLayout('logout', { xsrfToken });
  },
  postLogoutSuccessSource: async ctx => {
    ctx.type = 'html';
    ctx.body = await renderWithEjsLayout('logout-success');
  },
  routes: {
    authorization: '/oauth/authorize',
    token: '/oauth/token',
    userinfo: '/oauth/userinfo',
    end_session: '/oauth/logout',
  },
  renderError: async (ctx, { error, error_description }, err) => {
    console.error(err);

    ctx.type = 'html';
    ctx.body = await renderWithEjsLayout('error', {
      error_code: err.statusCode || err,
      error_message: `${error}: ${error_description}`,
    });
  },
  ttl: {
    // note that session is limited by short term cookie duration
    AccessToken: 3 * 60 * 60, // 3 hours in second
    IdToken: 3 * 60 * 60, // 3 hours in second
  },
  extraParams: ['source'],
};
