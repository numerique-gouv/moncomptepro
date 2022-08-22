import { findAccount } from './connectors/oidc-account-adapter';
import { renderWithEjsLayout } from './services/renderer';

const { SESSION_COOKIE_SECRET, SECURE_COOKIES = 'true' } = process.env;

const secureCookies = SECURE_COOKIES === 'true';
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
    long: { signed: true, secure: secureCookies, maxAge: cookiesMaxAge },
    // triple the default value of short.maxAge as interaction may include a password forgot process which can be longer than 10 minutes
    // This parameter set the session duration on DataPass.
    // On api-particulier-auth, it is the duration the session will remain open after the last activity.
    // Also related to https://github.com/panva/node-oidc-provider/issues/382.
    short: { signed: true, secure: secureCookies, maxAge: 3 * 60 * 60 * 1000 }, // 3 hours in ms,
    keys: cookiesSecrets,
  },
  claims: {
    amr: null,
    email: ['email', 'email_verified'],
    profile: ['family_name', 'given_name', 'updated_at', 'phone_number', 'job'],
    organizations: ['organizations'],
  },
  features: {
    devInteractions: { enabled: false },
    frontchannelLogout: { enabled: true },
    encryption: { enabled: true },
    introspection: { enabled: true },
  },
  findAccount,
  formats: { AccessToken: 'jwt' },
  logoutSource: async (ctx, form) => {
    ctx.req.session.user = null;
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
    introspection: '/oauth/token/introspection',
  },
  renderError: async (ctx, { error, error_description }, err) => {
    console.error(err);

    ctx.type = 'html';
    ctx.body = await renderWithEjsLayout('error', {
      error_code: err.statusCode || err,
      error_message: `${error}: ${error_description}`,
    });
  },
  scopes: ['openid', 'email', 'profile', 'organizations'],
  subjectTypes: ['public'],
  ttl: {
    // note that session is limited by short term cookie duration
    AccessToken: 3 * 60 * 60, // 3 hours in second
    IdToken: 3 * 60 * 60, // 3 hours in second
  },
};
