import session from "express-session";

export interface LoggedOutSessionData {
  email?: string;
  interactionId?: string;
  mustReturnOneOrganizationInPayload?: boolean;
  referrerPath?: string;
}

declare module "express-session" {
  export interface SessionData extends LoggedOutSessionData {
    user?: User;
  }
}
