import session from 'express-session';

declare module 'express-session' {
  export interface SessionData {
    email?: string;
    interactionId?: string;
    mustReturnOneOrganizationInPayload?: boolean;
    loginHint?: string;
    referer?: string;
    user?: User;
  }
}
