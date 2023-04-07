import { KoaContextWithOIDC } from 'oidc-provider';
import { NextFunction } from 'express';
import {
  recordNewConnection,
  sendFirstConnectionNotifications,
} from '../managers/oidc-client';
import * as Sentry from '@sentry/node';

// this is not an express middleware but an oidc-provider middleware as described here:
// https://github.com/panva/node-oidc-provider/blob/v7.x/docs/README.md#pre--and-post-middlewares
export const oidcProviderPostProcessingMiddleware = async (
  ctx: KoaContextWithOIDC,
  next: NextFunction
) => {
  // We do not have enough testing tools to properly cover this.
  // We developed it by manually testing the following user journey:
  // - the user log in application A
  // - the user log in application B
  // - the user logout from application A
  // - the user log in application A

  // We retro-engineered the oidcProvider behavior by logging variables as follows:
  // console.log('pre middleware', ctx.method, ctx.path);
  await next();
  // console.log('post middleware', ctx.method, ctx.oidc.route);
  // console.log(ctx.oidc.client?.clientId, 'ctx.oidc.client.clientId');
  // console.log(ctx.oidc.session?.accountId, 'ctx.oidc.session.accountId');

  if (
    (ctx.oidc.route === 'authorization' && ctx.oidc.session?.accountId) ||
    ctx.oidc.route === 'resume'
  ) {
    try {
      if (ctx.oidc.session?.accountId && ctx.oidc.client?.clientId) {
        // we record a new connection in 2 cases:
        // 1. a client ask for a connection and the oidcProvider answer back with an accountId
        // this happens when users is already logged in MonComptePro but not on the client
        // 2. a client ask for a connection but is not logged in MonComptePro
        // There is no accountId in the session, we wait for a session to be open.
        // This happens when hitting the resume route.
        const connection = await recordNewConnection(
          parseInt(ctx.oidc.session?.accountId, 10),
          ctx.oidc.client?.clientId
        );

        // When a new connection is recorded it may trigger additional email notifications
        const grantId = ctx.oidc.session.grantIdFor(ctx.oidc.client.clientId);
        const grant = await ctx.oidc.provider.Grant.find(grantId);
        // console.log(grant, 'grant');
        await sendFirstConnectionNotifications(
          connection,
          grant?.openid?.scope
        );
      } else {
        // This is unexpected, we log it in sentry
        const err = new Error(
          `Connection ignored in count! session: ${ctx.oidc.session}; client: ${ctx.oidc.client}`
        );
        console.error(err);
        Sentry.captureException(err);
      }
    } catch (err) {
      console.error(err);
      Sentry.captureException(err);
    }
  }
};
