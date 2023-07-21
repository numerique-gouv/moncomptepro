import session from 'express-session';

declare module 'express-session' {
  export interface SessionData {
    email?: string;
    interactionId?: string;
    mustReturnOneOrganizationInPayload?: boolean;
    referer?: string;
    user?: User;
  }
}
