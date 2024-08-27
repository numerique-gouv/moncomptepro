import { z } from "zod";
import { normalizeOfficialContactEmailVerificationToken } from "./normalize-official-contact-email-verification-token";
import {
  isEmailValid,
  isNameValid,
  isNotificationLabelValid,
  isPhoneNumberValid,
  isSiretValid,
  isVisibleString,
} from "./security";

export const siretSchema = () =>
  z
    .string()
    .trim()
    .refine(isSiretValid)
    .transform((val) => val.replace(/\s/g, ""));

export const emailSchema = () =>
  z.string().trim().toLowerCase().refine(isEmailValid);

export const nameSchema = () =>
  z.string().trim().min(1).refine(isVisibleString).refine(isNameValid);

export const phoneNumberSchema = () =>
  z.union([
    z.string().trim().refine(isPhoneNumberValid),
    z.literal("").transform(() => null),
  ]);

const pattern = /^(?![\d\s]+$).*/;
export const jobSchema = () =>
  z
    .string()
    .trim()
    .min(1)
    .refine(isVisibleString)
    .refine((value) => pattern.test(value));

export const idSchema = () =>
  z
    .string()
    .trim()
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
    .trim()
    .min(1)
    .transform((val) => normalizeOfficialContactEmailVerificationToken(val));

export const codeSchema = () =>
  z
    .string()
    .trim()
    .min(1)
    .transform((val) => val.replace(/\s+/g, ""));
