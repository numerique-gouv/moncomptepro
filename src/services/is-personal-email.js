// heavily inspired from https://stackoverflow.com/questions/71232973/check-email-domain-type-personal-email-or-company-email#answer-72640757
import emailProviders from 'email-providers/all.json';
import { parse_host } from 'tld-extract';

export const getEmailDomain = email => {
  const parts = email.split('@');
  const host = parts[parts.length - 1];
  const { domain } = parse_host(host);

  return domain;
};

export const isPersonalEmail = email => {
  const domain = getEmailDomain(email);

  return emailProviders.includes(domain);
};
