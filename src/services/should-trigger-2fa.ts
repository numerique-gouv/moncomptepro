import { UnknownObject } from "oidc-provider";
import { get, isArray } from "lodash-es";

interface EssentialAcrPromptDetail {
  name: "login" | "consent" | string;
  reasons: string[];
  details:
    | {
        acr: { essential: boolean; value?: string; values?: string[] };
      }
    | UnknownObject;
}

export const shouldTrigger2fa = (prompt: EssentialAcrPromptDetail) => {
  const value = get(prompt.details, "acr.value") as string | undefined;
  const values = get(prompt.details, "acr.values") as string[] | undefined;
  const essential = get(prompt.details, "acr.essential") as boolean | undefined;
  if (
    prompt.name === "login" &&
    prompt.reasons.includes("essential_acr") &&
    essential &&
    value === "https://refeds.org/profile/mfa"
  ) {
    return true;
  }

  if (
    prompt.name === "login" &&
    prompt.reasons.includes("essential_acrs") &&
    essential &&
    isArray(values) &&
    values.includes("https://refeds.org/profile/mfa")
  ) {
    return true;
  }
  return false;
};
