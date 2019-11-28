// src https://github.com/panva/node-oidc-provider-example/blob/d770e3387539d766d65a83cde52596b36f998a7d/01-oidc-configured/generate-keys.js
const fs = require('fs');
const path = require('path');
const {
  JWKS: { KeyStore },
} = require('@panva/jose');

const keystore = new KeyStore();
const keysFilePath = path.resolve('../jwks.json');

try {
  if (fs.existsSync(keysFilePath)) {
    console.log(`Key file already exist at ${keysFilePath}. Doing nothing.`);
    process.exit();
  }
} catch (e) {
  console.error(e);
  // do nothing
}

Promise.all([
  keystore.generate('RSA', 2048, { use: 'sig' }),
  keystore.generate('RSA', 2048, { use: 'enc' }),
  keystore.generate('EC', 'P-256', { use: 'sig' }),
  keystore.generate('EC', 'P-256', { use: 'enc' }),
  keystore.generate('OKP', 'Ed25519', { use: 'sig' }),
]).then(() => {
  fs.writeFileSync(
    keysFilePath,
    JSON.stringify(keystore.toJWKS(true), null, 2),
    { mode: 0o600 }
  );
  console.log(`A new key file has been generated at ${keysFilePath}`);
});
