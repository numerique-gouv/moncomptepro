import { run as spellCheckEmail } from "@zootools/email-spell-checker";
import gouvfrDomains from "../data/gouvfr-domains";
import mostUsedFreeEmailDomains from "../data/most-used-free-email-domains";
import otherGouvDomains from "../data/other-gouv-domains";

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
