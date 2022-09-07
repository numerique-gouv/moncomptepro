import { findAccount } from './connectors/oidc-account-adapter';
import { renderWithEjsLayout } from './services/renderer';

export const oidcProviderConfiguration = ({
  sessionMaxAgeInSeconds,
  SESSION_COOKIE_SECRET,
  useSecureCookies,
}) => ({
  acrValues: ['urn:mace:incommon:iap:bronze'],
  cookies: {
    names: {
      session: 'api_gouv_session',
      interaction: 'api_gouv_interaction',
      resume: 'api_gouv_interaction_resume',
      state: 'api_gouv_state',
    },
    long: { signed: true, secure: useSecureCookies },
    short: { signed: true, secure: useSecureCookies },
    keys: [SESSION_COOKIE_SECRET],
  },
  claims: {
    amr: null,
    email: ['email', 'email_verified'],
    profile: ['family_name', 'given_name', 'updated_at', 'phone_number', 'job'],
    organizations: ['organizations'],
  },
  features: {
    devInteractions: { enabled: false },
    rpInitiatedLogout: {
      enabled: true,
      logoutSource: async (ctx, form) => {
        ctx.req.session.user = null;
        const xsrfToken = /name="xsrf" value="([a-f0-9]*)"/.exec(form)[1];

        ctx.type = 'html';
        ctx.body = await renderWithEjsLayout('logout', { xsrfToken });
      },
      postLogoutSuccessSource: async ctx => {
        ctx.redirect('/?notification=logout_success');
      },
    },
    encryption: { enabled: true },
    introspection: { enabled: true },
  },
  findAccount,
  loadExistingGrant: async ctx => {
    // we want to skip the consent
    // inspired from https://github.com/panva/node-oidc-provider/blob/main/recipes/skip_consent.md
    const grantId =
      (ctx.oidc.result &&
        ctx.oidc.result.consent &&
        ctx.oidc.result.consent.grantId) ||
      ctx.oidc.session.grantIdFor(ctx.oidc.client.clientId);

    if (grantId) {
      // keep grant expiry aligned with session expiry
      // to prevent consent prompt being requested when grant expires
      const grant = await ctx.oidc.provider.Grant.find(grantId);

      // this aligns the Grant ttl with that of the current session
      // if the same Grant is used for multiple sessions, or is set
      // to never expire, you probably do not want this in your code
      if (ctx.oidc.account && grant.exp < ctx.oidc.session.exp) {
        grant.exp = ctx.oidc.session.exp;

        await grant.save();
      }

      return grant;
    } else {
      const grant = new ctx.oidc.provider.Grant({
        clientId: ctx.oidc.client.clientId,
        accountId: ctx.oidc.session.accountId,
      });

      grant.addOIDCScope(ctx.oidc.params.scope);
      await grant.save();

      return grant;
    }
  },
  pkce: { required: (ctx, client) => false },
  routes: {
    authorization: '/authorize',
    token: '/token',
    userinfo: '/userinfo',
    end_session: '/logout',
    introspection: '/token/introspection',
  },
  scopes: ['openid', 'email', 'profile', 'organizations'],
  subjectTypes: ['public'],
  ttl: {
    // AccessToken, IdToken and Interaction ttl are set to default value to remove warning in console
    AccessToken: 1 * 60 * 60, // 1 hour in seconds
    IdToken: 1 * 60 * 60, // 1 hour in seconds
    Interaction: 1 * 60 * 60, // 1 hour in seconds
    // Grant and Session ttl should be the same
    // see loadExistingGrant for more info
    Grant: sessionMaxAgeInSeconds,
    Session: sessionMaxAgeInSeconds,
  },
});
