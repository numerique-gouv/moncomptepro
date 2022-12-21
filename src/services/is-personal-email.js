// heavily inspired from https://stackoverflow.com/questions/71232973/check-email-domain-type-personal-email-or-company-email#answer-72640757
import { isFree } from 'is-disposable-email-domain';
import { parse_host } from 'tld-extract';

export const getEmailDomain = email => {
  const parts = email.split('@');
  const host = parts[parts.length - 1];
  const { domain } = parse_host(host, {allowDotlessTLD : true});

  return domain;
};

export const isPersonalEmail = email => {
  const domain = getEmailDomain(email);

  return isFree(domain);
};
