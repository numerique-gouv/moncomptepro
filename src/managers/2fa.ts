import { isEmpty } from "lodash-es";
import { UserIsNot2faCapableError, UserNotFoundError } from "../config/errors";
import { findById, update } from "../repositories/user";
import { isAuthenticatorAppConfiguredForUser } from "./totp";
import { isWebauthnConfiguredForUser } from "./webauthn";

export const shouldForce2faForUser = async (user_id: number) => {
  const user = await findById(user_id);
  if (isEmpty(user)) {
    throw new UserNotFoundError();
  }

  return user.force_2fa;
};

export const is2FACapable = async (user_id: number) => {
  if (await isAuthenticatorAppConfiguredForUser(user_id)) {
    return true;
  }

  if (await isWebauthnConfiguredForUser(user_id)) {
    return true;
  }

  return false;
};

export const disableForce2fa = async (user_id: number) => {
  const user = await findById(user_id);

  if (isEmpty(user)) {
    throw new UserNotFoundError();
  }

  return await update(user_id, { force_2fa: false });
};

export const enableForce2fa = async (user_id: number) => {
  const user = await findById(user_id);

  if (isEmpty(user)) {
    throw new UserNotFoundError();
  }

  if (!(await is2FACapable(user_id))) {
    throw new UserIsNot2faCapableError();
  }

  return await update(user_id, { force_2fa: true });
};
