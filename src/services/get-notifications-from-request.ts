import { Request } from 'express';
import { z } from 'zod';
import notificationMessages from '../notification-messages';

export const getNotificationLabelFromRequest = async (req: Request) => {
  const schema = z.object({
    query: z.object({
      notification: z.string().optional(),
    }),
  });

  const {
    query: { notification },
  } = await schema.parseAsync({
    query: req.query,
  });

  return notification;
};

export const getNotificationsFromRequest = async (req: Request) => {
  const notification = await getNotificationLabelFromRequest(req);

  return notification && notificationMessages[notification]
    ? [notificationMessages[notification]]
    : [];
};

export default getNotificationsFromRequest;
