export interface LoggedOutSessionData {
  email?: string;
  needsInclusionconnectWelcomePage?: boolean;
  interactionId?: string;
  mustReturnOneOrganizationInPayload?: boolean;
  referrerPath?: string;
}

export type AmrValue = "pwd" | "mail" | "totp" | "pop" | "uv" | "mfa";

export interface AuthenticatedSessionData {
  user: User;
  amr: AmrValue[];
}

declare module "express-session" {
  export interface SessionData extends LoggedOutSessionData {
    user?: User;
    temporaryEncryptedTotpKey?: string;
    amr?: AmrValue[];
  }
}
