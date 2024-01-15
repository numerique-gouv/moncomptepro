// src https://github.com/panva/node-oidc-provider-example/blob/d770e3387539d766d65a83cde52596b36f998a7d/01-oidc-configured/generate-keys.js
// usage : node ./scripts/generate-keys.js | xclip -selection c
// paste the result in a JWKS env var
const {
  JWKS: { KeyStore },
} = require("@panva/jose");

const keystore = new KeyStore();

Promise.all([
  keystore.generate("RSA", 2048, { use: "sig" }),
  keystore.generate("RSA", 2048, { use: "enc" }),
  keystore.generate("EC", "P-256", { use: "sig" }),
  keystore.generate("EC", "P-256", { use: "enc" }),
  keystore.generate("OKP", "Ed25519", { use: "sig" }),
]).then(() => {
  console.log(JSON.stringify(keystore.toJWKS(true)));
});
