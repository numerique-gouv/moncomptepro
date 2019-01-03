import fs from 'fs';
import path from 'path';
import { set } from 'lodash';
import helmet from 'helmet';
import express from 'express';
import session from 'express-session';
import Provider from 'oidc-provider';
import RedisClient from 'ioredis';
import connectRedis from 'connect-redis';
import morgan from 'morgan';

import adapter from './connectors/oidc-persistance-redis-adapter';
import {
  provider as providerConfiguration,
  cookiesMaxAge,
  cookiesSecrets,
} from './configuration';
import { keys } from './keystore';
import routes from './routes';
import { getClients } from './services/oidc-clients';

const { PORT = 3000, ISSUER = `http://localhost:${PORT}` } = process.env;
const RedisStore = connectRedis(session);
const redisClient = new RedisClient();
redisClient.on('connect', () =>
  console.log('Connected to database : redis://:@127.0.0.1:6380')
);

const app = express();
app.use(helmet());

const logger = morgan('combined', {
  stream: fs.createWriteStream(
    process.env.ACCESS_LOG_PATH || './api-scopes.log',
    { flags: 'a' }
  ),
});
app.use(logger);

app.use(
  session({
    store: new RedisStore({
      client: redisClient,
    }),
    secret: cookiesSecrets,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: cookiesMaxAge },
    // cookie: { secure: true }, // TODO app.set('trust proxy'); does not seems to work
  })
);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/assets', express.static('public'));

const provider = new Provider(ISSUER, providerConfiguration);

let server;

(async () => {
  await provider.initialize({
    adapter,
    clients: await getClients(),
    keystore: { keys },
  });
  // app.enable('trust proxy');
  provider.proxy = true;
  set(providerConfiguration, 'cookies.short.secure', true); // TODO does not work, see https://www.npmjs.com/package/express-session#cookiesecure ?
  set(providerConfiguration, 'cookies.long.secure', true); // TODO does not work

  routes(app, provider);
  app.use(provider.callback);
  server = app.listen(PORT, () => {
    console.log(`application is listening on port ${PORT}`);
  });
})().catch(err => {
  if (server && server.listening) server.close();
  console.error(err);
  process.exitCode = 1;
});
