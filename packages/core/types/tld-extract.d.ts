//

declare module "tld-extract" {
  function parse_host(domain: string, { allowDotlessTLD: boolean }): boolean;
}
