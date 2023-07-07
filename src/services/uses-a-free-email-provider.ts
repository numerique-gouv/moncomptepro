// heavily inspired from https://stackoverflow.com/questions/71232973/check-email-domain-type-personal-email-or-company-email#answer-72640757
import { isFree } from 'is-disposable-email-domain';
import { parse_host } from 'tld-extract';
import {
  CONSIDER_ALL_EMAIL_DOMAINS_AS_FREE,
  DO_NOT_VALIDATE_MAIL,
} from '../env';

export const isAFreeEmailProvider = (domain: string) => {
  if (CONSIDER_ALL_EMAIL_DOMAINS_AS_FREE) {
    return true;
  }

  if (DO_NOT_VALIDATE_MAIL) {
    return false;
  }

  return isFree(domain);
};

export const getEmailDomain = (email: string) => {
  const parts = email.split('@');
  const host = parts[parts.length - 1];
  const { sub, domain } = parse_host(host, { allowDotlessTLD: true });

  return [sub, domain].filter(e => !!e).join('.');
};

export const usesAFreeEmailProvider = (email: string) => {
  const domain = getEmailDomain(email);

  return isAFreeEmailProvider(domain);
};
