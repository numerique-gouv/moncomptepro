import cookieParser from "cookie-parser";
import {
  DO_NOT_AUTHENTICATE_BROWSER,
  SECURE_COOKIES,
  SESSION_COOKIE_SECRET,
  TRUSTED_BROWSER_COOKIE_MAX_AGE_IN_SECONDS,
} from "../config/env";
import { NextFunction, Request, Response } from "express";

export const setIsTrustedBrowserFromLoggedInSession = (req: Request) => {
  const parsedCookieValue = parseInt(
    req.signedCookies?.["trusted-browser"],
    10,
  );

  req.isTrustedBrowser = parsedCookieValue === req.session.user?.id;
};

export const trustedBrowserMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.headers.authorization) {
      return next();
    }
    return cookieParser(SESSION_COOKIE_SECRET)(req, res, (e) => {
      if (e) next(e);

      setIsTrustedBrowserFromLoggedInSession(req);

      next();
    });
  } catch (e) {
    next(e);
  }
};

export const isBrowserTrustedForUser = (req: Request): boolean => {
  return DO_NOT_AUTHENTICATE_BROWSER || req.isTrustedBrowser;
};

export const setBrowserAsTrustedForUser = (
  req: Request,
  res: Response,
  user_id: number,
): void => {
  req.isTrustedBrowser = true;
  res.cookie("trusted-browser", user_id, {
    maxAge: TRUSTED_BROWSER_COOKIE_MAX_AGE_IN_SECONDS * 1000,
    secure: SECURE_COOKIES,
    signed: true,
    sameSite: "lax",
    httpOnly: true,
  });
};
