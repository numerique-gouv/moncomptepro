// heavily inspired from https://stackoverflow.com/questions/71232973/check-email-domain-type-personal-email-or-company-email#answer-72640757
import { isFree } from 'is-disposable-email-domain';
import { parse_host } from 'tld-extract';

const doNotValidateMail = process.env.DO_NOT_VALIDATE_MAIL === 'True';

export const getEmailDomain = email => {
  const parts = email.split('@');
  const host = parts[parts.length - 1];
  const { sub, domain } = parse_host(host, { allowDotlessTLD: true });

  return [sub, domain].filter(e => !!e).join('.');
};

export const usesAFreeEmailProvider = email => {
  const domain = getEmailDomain(email);

  return !doNotValidateMail && isFree(domain);
};
