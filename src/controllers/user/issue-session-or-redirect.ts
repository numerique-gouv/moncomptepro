import { NextFunction, Request, Response } from "express";
import { isUrlTrusted } from "../../services/security";

export const issueSessionOrRedirectController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.session.interactionId) {
      return res.redirect(`/interaction/${req.session.interactionId}/login`);
    }

    if (req.session.referer && isUrlTrusted(req.session.referer)) {
      // copy string by value
      const referer = `${req.session.referer}`;
      // then delete referer value from session
      req.session.referer = undefined;
      return res.redirect(referer);
    }

    return res.redirect("/");
  } catch (error) {
    next(error);
  }
};
