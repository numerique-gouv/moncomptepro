import session from 'express-session';

declare module 'express-session' {
  export interface SessionData {
    email?: string;
    interactionId?: string;
    referer?: string;
    user?: import('./user');
  }
}
