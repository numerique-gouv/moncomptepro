import { NextFunction, Request, Response } from "express";
import { getTrustedReferrerPath } from "../../services/security";

export const issueSessionOrRedirectController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.session.interactionId) {
      return res.redirect(`/interaction/${req.session.interactionId}/login`);
    }

    if (
      req.session.referrerPath &&
      getTrustedReferrerPath(req.session.referrerPath)
    ) {
      // copy string by value
      const referrerPath = `${req.session.referrerPath}`;
      // then delete referer value from session
      req.session.referrerPath = undefined;
      return res.redirect(referrerPath);
    }

    return res.redirect("/");
  } catch (error) {
    next(error);
  }
};
