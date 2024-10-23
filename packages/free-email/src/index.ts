//

import { isFree } from "is-disposable-email-domain";
import mostUsedFreeEmailDomains from "./data/most-used-free-email-domains";

//

export function isAFreeDomain(domain: string) {
  // heavily inspired from https://stackoverflow.com/questions/71232973/check-email-domain-type-personal-email-or-company-email#answer-72640757
  return isFree(domain) || mostUsedFreeEmailDomains.includes(domain);
}
