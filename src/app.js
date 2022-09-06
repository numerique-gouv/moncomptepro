import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import connectRedis from 'connect-redis';
import express from 'express';
import session from 'express-session';
import fs from 'fs';
import helmet from 'helmet';
import morgan from 'morgan';
import Provider from 'oidc-provider';
import path from 'path';
import adapter from './connectors/oidc-persistance-redis-adapter';
import { getNewRedisClient } from './connectors/redis';
import { oidcProviderConfiguration } from './oidc-provider-configuration';
import { getClients } from './repositories/oidc-client';
import { apiRouter } from './routers/api';
import { interactionRouter } from './routers/interaction';
import { mainRouter } from './routers/main';
import { userRouter } from './routers/user';
import { ejsLayoutMiddlewareFactory } from './services/renderer';

export const sessionMaxAgeInSeconds = 1 * 24 * 60 * 60; // 1 day in seconds

const {
  PORT = 3000,
  API_AUTH_HOST = `http://localhost:${PORT}`,
  JWKS_PATH = '/opt/apps/api-auth/jwks.json',
  SESSION_COOKIE_SECRET,
  SENTRY_DSN,
} = process.env;
const jwks = require(JWKS_PATH);
const RedisStore = connectRedis(session);

const app = express();

app.use(helmet());
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

const logger = morgan('combined', {
  stream: fs.createWriteStream(
    process.env.ACCESS_LOG_PATH || './api-auth.log',
    { flags: 'a' }
  ),
});
app.use(logger);

app.set('trust proxy', 1);

app.use(
  session({
    store: new RedisStore({
      client: getNewRedisClient(),
    }),
    secret: [SESSION_COOKIE_SECRET],
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: sessionMaxAgeInSeconds * 1000, secure: true },
  })
);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
}

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

let server;

(async () => {
  const oidcProvider = new Provider(`${API_AUTH_HOST}`, {
    clients: await getClients(),
    adapter,
    jwks,
    ...oidcProviderConfiguration({
      sessionMaxAgeInSeconds,
      SESSION_COOKIE_SECRET,
    }),
  });
  oidcProvider.proxy = true;

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
  app.use('/oauth', oidcProvider.callback());

  app.use(Sentry.Handlers.errorHandler());

  app.use(async (err, req, res, next) => {
    console.error(err);

    return res.status(err.statusCode || 500).render('error', {
      error_code: err.statusCode || err,
      error_message: err.message,
    });
  });

  server = app.listen(PORT, () => {
    console.log(`application is listening on port ${PORT}`);
  });
})().catch(err => {
  if (server && server.listening) server.close();
  console.error(err);
  process.exit(1);
});
