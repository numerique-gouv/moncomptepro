import { NextFunction, Request, Response } from "express";
import Provider, { errors } from "oidc-provider";
import { getUserFromLoggedInSession } from "../managers/session";
import epochTime from "../services/epoch-time";
import { mustReturnOneOrganizationInPayload } from "../services/must-return-one-organization-in-payload";
import { postStartSignInController } from "./user/signin-signup";

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

      if (prompt.name === "login" && prompt.reasons.includes("login_prompt")) {
        if (login_hint) {
          req.session.email = login_hint;
          req.body.login = login_hint;
          return postStartSignInController(req, res, next);
        }

        return res.redirect(`/users/start-sign-in`);
      }

      if (prompt.name === "login" || prompt.name === "choose_organization") {
        if (login_hint) {
          req.session.email = login_hint;
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
      const user = getUserFromLoggedInSession(req);

      const result = {
        login: {
          accountId: user.id.toString(),
          acr: "eidas1",
          amr: ["pwd"],
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
