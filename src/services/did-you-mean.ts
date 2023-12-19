import { run as spellCheckEmail } from "@zootools/email-spell-checker";

// This list is extracted from production database with the following query:
// select unnest(authorized_email_domains) as domain, count(*) from organizations group by domain having count(*) > 10 order by count desc;
// we removed private owned email domain by hand.
const DOMAINS = [
  "gmail.com",
  "orange.fr",
  "wanadoo.fr",
  "hotmail.fr",
  "outlook.fr",
  "hotmail.com",
  "yahoo.fr",
  "laposte.net",
  "free.fr",
  "yahoo.com",
  "live.fr",
  "sfr.fr",
  "france-services.gouv.fr",
  "laposte.fr",
  "outlook.com",
  "icloud.com",
  "bbox.fr",
  "conseiller-numerique.fr",
  "gmx.fr",
  "neuf.fr",
  "aol.com",
  "me.com",
  "developpement-durable.gouv.fr",
  "interieur.gouv.fr",
  "justice.fr",
  "dgfip.finances.gouv.fr",
  "beta.gouv.fr",
  "finances.gouv.fr",
  "socgen.com",
  "protonmail.com",
];

const TLDS = ["fr", "com", "net"];

export const getDidYouMeanSuggestion = (email: string): string => {
  const suggestedEmail = spellCheckEmail({
    domains: DOMAINS,
    topLevelDomains: TLDS,
    email,
  });

  return suggestedEmail?.full ? suggestedEmail.full : "";
};
