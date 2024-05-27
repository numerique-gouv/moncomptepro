export interface LoggedOutSessionData {
  email?: string;
  needsInclusionconnectWelcomePage?: boolean;
  interactionId?: string;
  mustReturnOneOrganizationInPayload?: boolean;
  referrerPath?: string;
}

declare module "express-session" {
  export interface SessionData extends LoggedOutSessionData {
    user?: User;
    temporaryEncryptedTotpKey?: string;
    two_factor_verified: boolean;
  }
}
