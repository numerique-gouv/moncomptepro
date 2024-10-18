import { get, intersection, isArray, isEmpty } from "lodash-es";
import type { UnknownObject } from "oidc-provider";
import {
  ACR_VALUE_FOR_IAL1_AAL1,
  ACR_VALUE_FOR_IAL1_AAL2,
  ACR_VALUE_FOR_IAL2_AAL1,
  ACR_VALUE_FOR_IAL2_AAL2,
} from "../config/env";

// TODO rename this file
interface EssentialAcrPromptDetail {
  name: "login" | "consent" | string;
  reasons: string[];
  details:
    | {
        acr: { essential: boolean; value?: string; values?: string[] };
      }
    | UnknownObject;
}

const areAcrsRequestedInPrompt = ({
  prompt,
  acrs,
}: {
  prompt: EssentialAcrPromptDetail;
  acrs: string[];
}) => {
  const requestedAcr = get(prompt.details, "acr.value") as string | undefined;
  const requestedAcrs = get(prompt.details, "acr.values") as
    | string[]
    | undefined;
  const essential = get(prompt.details, "acr.essential") as boolean | undefined;

  if (
    prompt.name === "login" &&
    prompt.reasons.includes("essential_acr") &&
    essential &&
    acrs.includes(requestedAcr || "")
  ) {
    return true;
  }

  if (
    prompt.name === "login" &&
    prompt.reasons.includes("essential_acrs") &&
    essential &&
    isArray(requestedAcrs) &&
    !isEmpty(intersection(acrs, requestedAcrs))
  ) {
    return true;
  }

  return false;
};

export const twoFactorsAuthRequested = (prompt: EssentialAcrPromptDetail) => {
  return areAcrsRequestedInPrompt({
    prompt: prompt,
    acrs: [ACR_VALUE_FOR_IAL1_AAL2, ACR_VALUE_FOR_IAL2_AAL2],
  });
};

export const isThereAnyRequestedAcrOtherThanEidas1 = (
  prompt: EssentialAcrPromptDetail,
) => {
  return areAcrsRequestedInPrompt({
    prompt: prompt,
    acrs: [
      ACR_VALUE_FOR_IAL1_AAL1,
      ACR_VALUE_FOR_IAL1_AAL2,
      ACR_VALUE_FOR_IAL2_AAL1,
      ACR_VALUE_FOR_IAL2_AAL2,
    ],
  });
};

export const isAcrSatisfied = (
  prompt: EssentialAcrPromptDetail,
  currentAcr: string,
) => {
  // if no acr is required it is satisfied
  if (
    !(
      prompt.name === "login" &&
      (prompt.reasons.includes("essential_acr") ||
        prompt.reasons.includes("essential_acrs"))
    )
  ) {
    return true;
  }

  // if current acr is requested in prompt it is satisfied
  return areAcrsRequestedInPrompt({
    prompt: prompt,
    acrs: [currentAcr],
  });
};
