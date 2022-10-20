declare global {
  namespace Express {
    interface Request {
      originalUrl?: string;
    }
  }
}
