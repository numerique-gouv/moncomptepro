import { run as spellCheckEmail } from "@zootools/email-spell-checker";
import gouvfrDomains from "./did-you-mean/gouvfr-domains";
import otherGouvDomains from "./did-you-mean/other-gouv-domains";
import mostUsedFreeEmailDomains from "./did-you-mean/most-used-free-email-domains";

// Display an email suggestion for most used public domains
export const getDidYouMeanSuggestion = (email: string): string => {
  const suggestedEmail = spellCheckEmail({
    domains: [
      ...gouvfrDomains,
      ...otherGouvDomains,
      ...mostUsedFreeEmailDomains,
    ],
    topLevelDomains: ["fr", "com", "net"],
    email,
  });

  return suggestedEmail?.full ? suggestedEmail.full : "";
};
