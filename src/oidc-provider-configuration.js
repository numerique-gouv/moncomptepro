import { toPairs } from 'lodash';
import { findAccount } from './connectors/oidc-account-adapter';
import epochTime from './services/epoch-time';
import { renderWithEjsLayout } from './services/renderer';

export const oidcProviderConfiguration = ({
  sessionTtlInSeconds = 14 * 24 * 60 * 60,
  shortTokenTtlInSeconds = 10 * 60,
  tokenTtlInSeconds = 60 * 60,
}) => ({
  acrValues: ['urn:mace:incommon:iap:bronze'],
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
        // If ctx.oidc.session is null (ie. koa session has ended or expired), logoutSource is not called.
        // If ctx.oidc.params.client_id is not null (ie. logout initiated from Relying Party), postLogoutSuccessSource is not called
        // We nullify the express session here too to make sure user is logged out from express.
        ctx.req.session.user = null;
        ctx.redirect('/users/start-sign-in/?notification=logout_success');
      },
    },
    encryption: { enabled: true },
    introspection: { enabled: true },
  },
  findAccount,
  loadExistingGrant: async ctx => {
    // we want to skip the consent
    // inspired from https://github.com/panva/node-oidc-provider/blob/main/recipes/skip_consent.md

    // keep grant expiry aligned with session expiry
    // to prevent consent prompt being requested when grant expires
    await Promise.all(
      toPairs(ctx.oidc.session.authorizations).map(async ([, { grantId }]) => {
        const grant = await ctx.oidc.provider.Grant.find(grantId);
        // this aligns the Grant ttl with that of the current session
        // if the same Grant is used for multiple sessions, or is set
        // to never expire, you probably do not want this in your code
        grant.exp = epochTime() + sessionTtlInSeconds;
        await grant.save();
      })
    );

    const grantId = ctx.oidc.session.grantIdFor(ctx.oidc.client.clientId);
    if (grantId) {
      return await ctx.oidc.provider.Grant.find(grantId);
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
    // Set ttl to default value to remove warning in console
    AccessToken: tokenTtlInSeconds,
    AuthorizationCode: shortTokenTtlInSeconds,
    IdToken: tokenTtlInSeconds,
    Interaction: tokenTtlInSeconds,
    // Grant and Session ttl should be the same
    // see loadExistingGrant for more info
    Grant: sessionTtlInSeconds,
    RefreshToken: sessionTtlInSeconds,
    Session: sessionTtlInSeconds,
  },
});
