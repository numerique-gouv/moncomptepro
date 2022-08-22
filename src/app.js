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
import apiRoutes from './api-routes';
import {
  cookiesMaxAge,
  cookiesSecrets,
  provider as providerConfiguration,
} from './configuration';

import adapter from './connectors/oidc-persistance-redis-adapter';
import { getNewRedisClient } from './connectors/redis';
import { getClients } from './repositories/oidc-client';
import routes from './routes';

const {
  PORT = 3000,
  API_AUTH_HOST = `http://localhost:${PORT}`,
  ISSUER = `${API_AUTH_HOST}`,
  JWKS_PATH = '/opt/apps/api-auth/jwks.json',
  SECURE_COOKIES = 'true',
  SENTRY_DSN,
} = process.env;
const jwks = require(JWKS_PATH);
const secureCookies = SECURE_COOKIES === 'true';
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

  // if (req.url.startsWith('/oauth/authorize/')) {
  //   cspConfig.directives.scriptSrc.push("'unsafe-inline'");
  // }
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
    secret: cookiesSecrets,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: cookiesMaxAge, secure: secureCookies },
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
  const provider = new Provider(ISSUER, {
    clients: await getClients(),
    adapter,
    jwks,
    ...providerConfiguration,
  });
  provider.proxy = true;

  app.use(
    '/assets',
    express.static('public', { maxAge: 365 * 24 * 60 * 60 * 1000 })
  ); // 1 year in milliseconds
  routes(app, provider);
  apiRoutes(app);

  app.use(provider.callback());
  server = app.listen(PORT, () => {
    console.log(`application is listening on port ${PORT}`);
  });
})().catch(err => {
  if (server && server.listening) server.close();
  console.error(err);
  process.exit(1);
});
