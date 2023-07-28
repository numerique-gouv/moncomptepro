import { findAccount } from './services/oidc-account-adapter';
import { renderWithEjsLayout } from './services/renderer';
import epochTime from './services/epoch-time';
import policy from './services/oidc-policy';
import { deleteSelectedOrganizationId } from './repositories/redis/selected-organization';
import { isEmpty } from 'lodash';

export const oidcProviderConfiguration = ({
  sessionTtlInSeconds = 14 * 24 * 60 * 60,
  shortTokenTtlInSeconds = 10 * 60,
  tokenTtlInSeconds = 60 * 60,
}) => ({
  acrValues: ['eidas1'],
  claims: {
    amr: null,
    // claims definitions can be found here: https://openid.net/specs/openid-connect-core-1_0.html#ScopeClaims
    openid: ['sub'],
    email: ['email', 'email_verified'],
    profile: ['family_name', 'given_name', 'updated_at', 'job'],
    phone: ['phone_number', 'phone_number_verified'],
    organization: [
      'label',
      'siret',
      'is_collectivite_territoriale',
      'is_external',
      'is_service_public',
    ],
    // This scope will be deprecated
    organizations: ['organizations'],
    // Additional scopes for AgentConnect use only
    uid: ['uid'],
    given_name: ['given_name'],
    usual_name: ['usual_name'],
    siret: ['siret'],
    is_service_public: ['is_service_public'],
  },
  features: {
    claimsParameter: { enabled: true },
    devInteractions: { enabled: false },
    encryption: { enabled: true },
    introspection: { enabled: true },
    jwtUserinfo: { enabled: true },
    rpInitiatedLogout: {
      enabled: true,
      // @ts-ignore
      logoutSource: async (ctx, form) => {
        if (!isEmpty(ctx.req.session.user)) {
          await deleteSelectedOrganizationId(ctx.req.session.user.id);
        }
        ctx.req.session.user = null;
        const csrfToken = /name="xsrf" value="([a-f0-9]*)"/.exec(form)![1];

        ctx.type = 'html';
        ctx.body = await renderWithEjsLayout('autosubmit-form', {
          csrfToken,
          actionLabel: 'Déconnexion...',
          actionPath: '/oauth/logout/confirm',
          inputName: 'logout',
          inputValue: 'non-empty-value',
        });
      },
      // @ts-ignore
      postLogoutSuccessSource: async (ctx) => {
        // If ctx.oidc.session is null (ie. koa session has ended or expired), logoutSource is not called.
        // If ctx.oidc.params.client_id is not null (ie. logout initiated from Relying Party), postLogoutSuccessSource is not called
        // We nullify the express session here too to make sure user is logged out from express.
        if (!isEmpty(ctx.req.session.user)) {
          await deleteSelectedOrganizationId(ctx.req.session.user.id);
        }
        ctx.req.session.user = null;
        ctx.redirect('/users/start-sign-in/?notification=logout_success');
      },
    },
  },
  findAccount,
  interactions: {
    policy,
  },
  // @ts-ignore
  loadExistingGrant: async (ctx) => {
    // we want to skip the consent
    // inspired from https://github.com/panva/node-oidc-provider/blob/main/recipes/skip_consent.md
    // We updated the function to ensure it always return a grant.
    // As a consequence, the consent prompt should never be requested afterward.

    // The grant id never comes from consent results so we simplified this line
    const grantId = ctx.oidc.session.grantIdFor(ctx.oidc.client.clientId);

    let grant;

    if (grantId) {
      grant = await ctx.oidc.provider.Grant.find(grantId);
      // if the grant has expired, grant can be undefined at this point.
      if (grant) {
        // keep grant expiry aligned with session expiry to prevent consent
        // prompt being requested when grant is about to expires.
        // The original code is overkill as session length is extended on every
        // interaction.
        grant.exp = epochTime() + sessionTtlInSeconds;
        await grant.save();
      }
    }

    if (!grant) {
      grant = new ctx.oidc.provider.Grant({
        clientId: ctx.oidc.client.clientId,
        accountId: ctx.oidc.session.accountId,
      });
    }

    // event existing grant should be updated, as requested scopes might
    // be different
    grant.addOIDCScope(ctx.oidc.params.scope);
    await grant.save();
    return grant;
  },
  pkce: { required: () => false },
  responseTypes: ['code'],
  routes: {
    authorization: '/authorize',
    token: '/token',
    userinfo: '/userinfo',
    end_session: '/logout',
    introspection: '/token/introspection',
  },
  scopes: [
    'openid',
    'email',
    'profile',
    'organization',
    // This scope will be deprecated
    'organizations',
    // Additional scopes for AgentConnect use only
    'uid',
    'given_name',
    'usual_name',
    'siret',
    'is_service_public',
  ],
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
