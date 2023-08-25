import session from 'express-session';

export interface LoggedOutSessionData {
  email?: string;
  interactionId?: string;
  mustReturnOneOrganizationInPayload?: boolean;
  loginHint?: string;
  referer?: string;
}

declare module 'express-session' {
  export interface SessionData extends LoggedOutSessionData {
    user?: User;
  }
}
