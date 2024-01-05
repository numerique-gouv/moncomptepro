import session from "express-session";

export interface LoggedOutSessionData {
  email?: string;
  interactionId?: string;
  mustReturnOneOrganizationInPayload?: boolean;
  referer?: string;
}

declare module "express-session" {
  export interface SessionData extends LoggedOutSessionData {
    user?: User;
  }
}
