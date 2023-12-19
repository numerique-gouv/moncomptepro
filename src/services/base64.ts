export const encodeBase64URL = (buffer: Uint8Array): string => {
  // Convert the Uint8Array to a Buffer
  let base64String: string = Buffer.from(buffer).toString('base64');

  // Make the Base64 string URL-safe
  return base64String
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export const decodeBase64URL = (base64URLString: string): Uint8Array => {
  // Replace URL-safe characters with base64 standard characters
  let base64String: string = base64URLString
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  // Convert the Base64 string to a Buffer
  let buffer: Buffer = Buffer.from(base64String, 'base64');

  // Convert the Buffer to a Uint8Array
  return new Uint8Array(buffer);
};
