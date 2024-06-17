import { NextFunction, Request, Response } from "express";
import Provider, { errors } from "oidc-provider";
import {
  getSessionStandardizedAuthenticationMethodsReferences,
  getUserFromAuthenticatedSession,
  isWithinTwoFactorAuthenticatedSession,
} from "../managers/session/authenticated";
import epochTime from "../services/epoch-time";
import { mustReturnOneOrganizationInPayload } from "../services/must-return-one-organization-in-payload";
import { postStartSignInController } from "./user/signin-signup";
import { setEmailInUnauthenticatedSession } from "../managers/session/unauthenticated";
import { shouldTrigger2fa } from "../services/should-trigger-2fa";

export const interactionStartControllerFactory =
  (oidcProvider: any) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        uid: interactionId,
        params: { login_hint, scope },
        prompt,
      } = await oidcProvider.interactionDetails(req, res);

      req.session.interactionId = interactionId;
      req.session.mustReturnOneOrganizationInPayload =
        mustReturnOneOrganizationInPayload(scope);

      if (shouldTrigger2fa(prompt)) {
        req.session.mustUse2FA = true;
      }

      if (prompt.name === "login" && prompt.reasons.includes("login_prompt")) {
        if (login_hint) {
          setEmailInUnauthenticatedSession(req, login_hint);
          req.body.login = login_hint;
          return postStartSignInController(req, res, next);
        }

        return res.redirect(`/users/start-sign-in`);
      }

      if (prompt.name === "login" || prompt.name === "choose_organization") {
        if (login_hint) {
          setEmailInUnauthenticatedSession(req, login_hint);
          req.body.login = login_hint;
          return postStartSignInController(req, res, next);
        }

        return res.redirect(`/interaction/${interactionId}/login`);
      }

      if (prompt.name === "select_organization") {
        return res.redirect(`/users/select-organization`);
      }

      if (prompt.name === "update_userinfo") {
        return res.redirect(`/users/personal-information`);
      }

      return next(new Error(`unknown_interaction_name ${prompt.name}`));
    } catch (error) {
      return next(error);
    }
  };

export const interactionEndControllerFactory =
  (oidcProvider: Provider) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = getUserFromAuthenticatedSession(req);

      const result = {
        login: {
          accountId: user.id.toString(),
          acr: isWithinTwoFactorAuthenticatedSession(req)
            ? "https://refeds.org/profile/mfa"
            : "eidas1",
          amr: getSessionStandardizedAuthenticationMethodsReferences(req),
          ts: user.last_sign_in_at
            ? epochTime(user.last_sign_in_at)
            : undefined,
        },
        select_organization: false,
        update_userinfo: false,
      };

      const { prompt } = await oidcProvider.interactionDetails(req, res);
      if (prompt.name === "select_organization") {
        result.select_organization = true;
      }

      if (prompt.name === "update_userinfo") {
        result.update_userinfo = true;
      }

      req.session.interactionId = undefined;
      req.session.mustReturnOneOrganizationInPayload = undefined;
      req.session.mustUse2FA = undefined;

      await oidcProvider.interactionFinished(req, res, result);
    } catch (error) {
      if (error instanceof errors.SessionNotFound) {
        // we may have taken to long to provide a session to the user since he has been redirected
        // we fail silently
        return res.redirect("/");
      }

      next(error);
    }
  };
