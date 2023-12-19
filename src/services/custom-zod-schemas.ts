import {
  isEmailValid,
  isNameValid,
  isNotificationLabelValid,
  isPhoneNumberValid,
  isSiretValid,
} from "./security";
import { z } from "zod";
import { normalizeOfficialContactEmailVerificationToken } from "./normalize-official-contact-email-verification-token";

export const siretSchema = () =>
  z
    .string()
    .refine(isSiretValid)
    .transform((val) => val.replace(/\s/g, ""));

export const emailSchema = () =>
  z
    .string()
    .refine(isEmailValid)
    .transform((val) => val.toLowerCase().trim());

export const nameSchema = () => z.string().min(1).refine(isNameValid);

export const phoneNumberSchema = () =>
  z.union([
    z.string().refine(isPhoneNumberValid),
    z.literal("").transform(() => null),
  ]);

export const idSchema = () =>
  z
    .string()
    .min(1)
    .refine((val) => val.match(/^\d*$/))
    .transform((val) => parseInt(val, 10));

export const optionalBooleanSchema = () =>
  z
    .string()
    .optional()
    .transform((val) => val === "true");

export const notificationLabelSchema = () =>
  z.string().refine(isNotificationLabelValid).optional();

export const officialContactEmailVerificationTokenSchema = () =>
  z
    .string()
    .min(1)
    .transform((val) => normalizeOfficialContactEmailVerificationToken(val));
