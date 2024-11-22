//

import { isAFreeDomain } from "@gouvfr-lasuite/moncomptepro.core/services/email/isAFreeDomain.js";
import { parse_host } from "tld-extract";
import {
  FEATURE_CONSIDER_ALL_EMAIL_DOMAINS_AS_FREE,
  FEATURE_CONSIDER_ALL_EMAIL_DOMAINS_AS_NON_FREE,
} from "../config/env";

export const isAFreeEmailProvider = (domain: string) => {
  if (FEATURE_CONSIDER_ALL_EMAIL_DOMAINS_AS_FREE) {
    return true;
  }

  if (FEATURE_CONSIDER_ALL_EMAIL_DOMAINS_AS_NON_FREE) {
    return false;
  }

  return isAFreeDomain(domain);
};

export const getEmailDomain = (email: string) => {
  const parts = email.split("@");
  const host = parts[parts.length - 1];
  const { sub, domain } = parse_host(host, { allowDotlessTLD: true });

  return [sub, domain].filter((e) => !!e).join(".");
};

export const usesAFreeEmailProvider = (email: string) => {
  const domain = getEmailDomain(email);

  return isAFreeEmailProvider(domain);
};
