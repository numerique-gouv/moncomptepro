import { NextFunction, Request, Response } from "express";
import {
  destroyAuthenticatedSession,
  getUserFromAuthenticatedSession,
} from "../../managers/session";
import { deleteUser } from "../../repositories/user";
import { logger } from "../../services/log";

export const postDeleteUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, email } = getUserFromAuthenticatedSession(req);

    await deleteUser(id);
    logger.info(`user ${email} successfully deleted`);
    await destroyAuthenticatedSession(req);

    return res.redirect(
      `/users/start-sign-in?notification=user_successfully_deleted`,
    );
  } catch (error) {
    next(error);
  }
};
