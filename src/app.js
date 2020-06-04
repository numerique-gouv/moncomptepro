import fs from 'fs';
import path from 'path';
import helmet from 'helmet';
import express from 'express';
import session from 'express-session';
import Provider from 'oidc-provider';
import connectRedis from 'connect-redis';
import morgan from 'morgan';

import adapter from './connectors/oidc-persistance-redis-adapter';
import { getNewRedisClient } from './connectors/redis';
import {
  provider as providerConfiguration,
  cookiesMaxAge,
  cookiesSecrets,
} from './configuration';
import routes from './routes';
import { getClients } from './repositories/oidc-client';

const {
  PORT = 3000,
  API_AUTH_HOST = `http://localhost:${PORT}`,
  ISSUER = `${API_AUTH_HOST}`,
  JWKS_PATH = '/opt/apps/api-auth/jwks.json',
  SECURE_COOKIES = 'true',
} = process.env;
const jwks = require(JWKS_PATH);
const secureCookies = SECURE_COOKIES === 'true';
const RedisStore = connectRedis(session);

const app = express();

app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'stats.data.gouv.fr'],
      connectSrc: ["'self'", 'entreprise.data.gouv.fr'],
      scriptSrc: ["'self'", 'stats.data.gouv.fr'],
      styleSrc: ["'self'", 'unpkg.com'],
      fontSrc: ["'self'", 'unpkg.com'],
    },
  })
);

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

app.use('/assets', express.static('public'));

let server;

(async () => {
  const provider = new Provider(ISSUER, {
    clients: await getClients(),
    adapter,
    jwks,
    ...providerConfiguration,
  });
  provider.proxy = true;

  routes(app, provider);
  app.use(provider.callback);
  server = app.listen(PORT, () => {
    console.log(`application is listening on port ${PORT}`);
  });
})().catch(err => {
  if (server && server.listening) server.close();
  console.error(err);
  process.exit(1);
});
