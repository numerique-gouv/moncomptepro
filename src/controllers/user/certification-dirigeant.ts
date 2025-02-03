//

import { createChecks } from "@gouvfr-lasuite/proconnect.identite/certification/executive";
import { UserVerificationTypeSchema } from "@gouvfr-lasuite/proconnect.identite/types";
import type { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { z } from "zod";
import { FRANCECONNECT_CALLBACK_URL, HOST } from "../../config/env";
import { OidcError } from "../../config/errors";
import {
  getFranceConnectRedirectUrl,
  getFranceConnectUser,
} from "../../connectors/franceconnect";
import { getUserFromAuthenticatedSession } from "../../managers/session/authenticated";
import { FranceConnectOidcSessionSchema } from "../../managers/session/certification";
import { verifyUserWith } from "../../managers/user";
import { csrfToken } from "../../middlewares/csrf-protection";
import getNotificationsFromRequest from "../../services/get-notifications-from-request";

//

export async function getCertificationDirigeantController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    return res.render("user/certification-dirigeant", {
      csrfToken: csrfToken(req),
      pageTitle: "Certification dirigeant",
    });
  } catch (error) {
    next(error);
  }
}

export async function postCertificationDirigeantController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { nonce, state } = createChecks();
    req.session.nonce = nonce;
    req.session.state = state;

    const url = await getFranceConnectRedirectUrl(nonce, state);

    return res.redirect(url.toString());
  } catch (error) {
    next(error);
  }
}

//

export async function getCertificationDirigeantOidcCallbackController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const errorQuery = await z
      .object({ error: z.string(), error_description: z.string() })
      .safeParseAsync(req.query);

    if (errorQuery.success) {
      const { error, error_description } = errorQuery.data;
      throw new OidcError(error, error_description);
    }

    const { code } = await z.object({ code: z.string() }).parseAsync(req.query);

    const { nonce, state } = await FranceConnectOidcSessionSchema.parseAsync(
      req.session,
    );
    const { family_name, given_name } = await getFranceConnectUser({
      code,
      currentUrl: `${HOST}${FRANCECONNECT_CALLBACK_URL}${req.url.substring(req.path.length)}`,
      expectedNonce: nonce,
      expectedState: state,
    });

    req.session.franceconnectUserInfo = { family_name, given_name };

    // NOTE(douglasduteil): Redirect to another page to allow page reload
    // As the user can be redirected to the certification-dirigeant page and the code is onetime use only,
    // we should redirect to another page after storing the FranceConnect data in the session
    return res.redirect("/users/certification-dirigeant/login-as");
  } catch (error) {
    next(error);
  }
}

export async function getCertificationDirigeantLoginAsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { franceconnectUserInfo } = req.session;
    if (!franceconnectUserInfo) {
      return next(new HttpErrors.Unauthorized());
    }
    const { family_name, given_name } = franceconnectUserInfo;

    // TODO(douglasduteil): handle FC logout
    // Should we directly logout from FC after this using the _idToken ?

    return res.render("user/certification-dirigeant-login-as", {
      csrfToken: csrfToken(req),
      notifications: await getNotificationsFromRequest(req),
      pageTitle: "Se connecter en tant que",
      name: `${given_name} ${family_name}`,
    });
  } catch (error) {
    next(error);
  }
}

export async function postCertificationDirigeantLoginAsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { franceconnectUserInfo } = req.session;
    if (!franceconnectUserInfo) {
      return next(new HttpErrors.Unauthorized());
    }
    const schema = z.object({
      agreement: z.literal("on").optional(),
    });

    const { agreement } = await schema.parseAsync(req.body);

    if (agreement !== "on") {
      return res.redirect(
        "/users/certification-dirigeant/login-as?notification=certification_franceconnect_data_transmission_agreement_required",
      );
    }

    const { id: user_id } = getUserFromAuthenticatedSession(req);

    await verifyUserWith(
      UserVerificationTypeSchema.Enum.franceconnect,
      user_id,
      franceconnectUserInfo,
    );

    // ~~Should we redirect to a "welcome" page for franceconnected users ?~~
    // Should we go the organization selection page ?
    // return res.redirect("/users/sign-in");
    // return res.redirect("/users/sign-in");
    next();
  } catch (error) {
    next(error);
  }
}

//

export async function getCertificationDirigeantRepresentingController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userOrganizations = [
      {
        id: "1",
        siret: "12345678901234",
        cached_libelle: "Organisation 1",
        cached_adresse: "123 rue de la paix",
        cached_libelle_activite_principale: "Activité principale 1",
      },
    ];
    return res.render("user/select-organization", {
      csrfToken: csrfToken(req),
      illustration: "illu-password.svg",
      pageTitle: "Choisir une organisation",
      userOrganizations,
    });
  } catch (error) {
    next(error);
  }
}
