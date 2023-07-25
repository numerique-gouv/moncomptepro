import * as Sentry from '@sentry/node';
// @ts-ignore
import connectRedis from 'connect-redis';
import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import fs from 'fs';
// @ts-ignore
import helmet from 'helmet';
import { Server } from 'http';
import morgan from 'morgan';
import Provider from 'oidc-provider';
import path from 'path';
import oidcProviderRepository from './repositories/redis/oidc-provider';
import { getNewRedisClient } from './connectors/redis';
import { oidcProviderConfiguration } from './oidc-provider-configuration';
import { getClients } from './repositories/oidc-client';
import { apiRouter } from './routers/api';
import { interactionRouter } from './routers/interaction';
import { mainRouter } from './routers/main';
import { userRouter } from './routers/user';
import {
  ejsLayoutMiddlewareFactory,
  renderWithEjsLayout,
} from './services/renderer';
import { HttpError } from 'http-errors';
import { ZodError } from 'zod';
import { connectionCountMiddleware } from './middlewares/connection-count';
import { isNull, omitBy } from 'lodash';
import {
  ACCESS_LOG_PATH,
  JWKS_PATH,
  MONCOMPTEPRO_HOST,
  PORT,
  SECURE_COOKIES,
  SENTRY_DSN,
  SESSION_COOKIE_SECRET,
  SESSION_MAX_AGE_IN_SECONDS,
} from './env';

const jwks = require(JWKS_PATH);
const RedisStore = connectRedis(session);

const app = express();

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
  });
}

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

app.use(
  helmet({
    hsts: false,
    frameguard: false,
  })
);

app.use((req, res, next) => {
  const cspConfig = {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'stats.data.gouv.fr'],
      connectSrc: ["'self'", 'stats.data.gouv.fr'],
      scriptSrc: ["'self'", 'stats.data.gouv.fr'],
      styleSrc: ["'self'"],
      fontSrc: ["'self'", 'data:'],
    },
  };

  helmet.contentSecurityPolicy(cspConfig)(req, res, next);
});

let morganOption = {};

if (ACCESS_LOG_PATH) {
  morganOption = {
    stream: fs.createWriteStream(ACCESS_LOG_PATH, { flags: 'a' }),
  };
}

const logger = morgan('combined', morganOption);
app.use(logger);

app.set('trust proxy', 1);

const sessionMiddleware =
  // @ts-ignore
  session({
    store: new RedisStore({
      client: getNewRedisClient(),
    }),
    secret: [SESSION_COOKIE_SECRET],
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: SESSION_MAX_AGE_IN_SECONDS * 1000,
      secure: SECURE_COOKIES,
    },
  });

// Prevent creation of sessions for API calls on /oauth or /api routes
app.use((req, res, next) => {
  if (req.headers.authorization) {
    return next();
  }
  return sessionMiddleware(req, res, next);
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

let server: Server;

(async () => {
  const clients = await getClients();

  // the oidc provider expect provided client attributes to be not null if provided
  const clientsWithoutNullProperties = clients.map(client =>
    omitBy(client, isNull)
  );

  // @ts-ignore
  const oidcProvider = new Provider(`${MONCOMPTEPRO_HOST}`, {
    clients: clientsWithoutNullProperties,
    adapter: oidcProviderRepository,
    jwks,
    // @ts-ignore
    renderError: async (ctx, { error, error_description }, err) => {
      console.error(err);
      Sentry.withScope(scope => {
        scope.addEventProcessor(event => {
          return Sentry.addRequestDataToEvent(event, ctx.request);
        });
        Sentry.captureException(err);
      });

      ctx.type = 'html';
      ctx.body = await renderWithEjsLayout('error', {
        error_code: err.statusCode || err,
        error_message: `${error}: ${error_description}`,
      });
    },
    cookies: {
      names: {
        session: 'api_gouv_session',
        interaction: 'api_gouv_interaction',
        resume: 'api_gouv_interaction_resume',
        state: 'api_gouv_state',
      },
      long: { overwrite: true, signed: true, secure: SECURE_COOKIES },
      short: { overwrite: true, signed: true, secure: SECURE_COOKIES },
      keys: [SESSION_COOKIE_SECRET],
    },
    ...oidcProviderConfiguration({
      sessionTtlInSeconds: SESSION_MAX_AGE_IN_SECONDS,
    }),
  });
  oidcProvider.proxy = true;
  oidcProvider.use(connectionCountMiddleware);

  app.use(
    '/assets',
    express.static('public', { maxAge: 7 * 24 * 60 * 60 * 1000 })
  ); // 1 week in milliseconds
  app.get('/favicon.ico', function(req, res, next) {
    return res.sendFile('favicons/favicon.ico', {
      root: 'public',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  });

  app.use('/', mainRouter(app));
  app.use(
    '/interaction',
    ejsLayoutMiddlewareFactory(app),
    interactionRouter(oidcProvider)
  );
  app.use('/users', ejsLayoutMiddlewareFactory(app), userRouter());
  app.use('/api', apiRouter());

  app.use((req, res, next) => {
    if (req.url === '/.well-known/openid-configuration') {
      req.url = '/oauth/.well-known/openid-configuration';
    }
    next();
  });
  app.use('/oauth', oidcProvider.callback());

  app.use(async (req, res, next) => {
    res.setHeader('Content-Type', 'text/html');
    res.status(404).send(await renderWithEjsLayout('not-found-error'));
  });

  // The error handler must be before any other error middleware and after all controllers
  app.use(Sentry.Handlers.errorHandler());

  app.use(
    (
      err: HttpError | ZodError,
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      console.error(err);

      if (err instanceof ZodError) {
        return res.status(400).render('error', {
          error_code: 400,
          error_message: err.message,
        });
      }

      return res.status(err.statusCode || 500).render('error', {
        error_code: err.statusCode || err,
        error_message: err.message,
      });
    }
  );

  server = app.listen(PORT, () => {
    console.log(`application is listening on port ${PORT}`);
  });
})().catch(err => {
  if (server && server.listening) server.close();
  console.error(err);
  process.exit(1);
});
