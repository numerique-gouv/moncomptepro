import { isEmailValid, isSiretValid } from './security';
import { z } from 'zod';

export const siretSchema = () =>
  z
    .string()
    .refine(isSiretValid)
    .transform(val => val.replace(/\s/g, ''));

export const emailSchema = () =>
  z
    .string()
    .refine(isEmailValid)
    .transform(val => val.toLowerCase().trim());

export const idSchema = () =>
  z
    .string()
    .min(1)
    .refine(val => val.match(/^\d*$/))
    .transform(val => parseInt(val, 10));

export const optionalBooleanSchema = () =>
  z
    .string()
    .optional()
    .transform(val => val === 'true');
