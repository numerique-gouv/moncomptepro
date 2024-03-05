import { Request } from "express";
import { z, ZodError } from "zod";
import notificationMessages from "../config/notification-messages";
import { notificationLabelSchema } from "./custom-zod-schemas";

export const getNotificationLabelFromRequest = async (req: Request) => {
  try {
    const schema = z.object({
      notification: notificationLabelSchema(),
    });

    const { notification } = await schema.parseAsync(req.query);

    return notification || null;
  } catch (e) {
    if (e instanceof ZodError) {
      // fail silently
      return null;
    }

    throw e;
  }
};

export const getNotificationsFromRequest = async (req: Request) => {
  const notification = await getNotificationLabelFromRequest(req);

  return notification && notificationMessages[notification]
    ? [notificationMessages[notification]]
    : [];
};

export default getNotificationsFromRequest;
