//

declare module "tld-extract" {
  interface ParseHostOptions {
    allowPrivateTLD?: boolean;
    allowUnknownTLD?: boolean;
    allowDotlessTLD?: boolean;
  }

  function parse_host(
    host: string,
    options: ParseHostOptions,
  ): {
    tld: string;
    domain: string;
    sub: string;
  };
}
