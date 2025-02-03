//

import type { NextFunction, Request, Response } from "express";
import crypto from "node:crypto";
import { z } from "zod";
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
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // return res.redirect("/users/certification-dirigeant/login-as");
    const url = new URL(
      "https://fcp.integ01.dev-franceconnect.fr/api/v1/authorize",
    );
    url.search = new URLSearchParams({
      scope: [
        "openid",
        "given_name",
        "family_name",
        "gender",
        "preferred_username",
        "birthdate",
      ].join(" "),
      redirect_uri: `http://localhost:3000/login-callback`,
      response_type: "code",
      client_id:
        "211286433e39cce01db448d80181bdfd005554b19cd51b3fe7943f6b3b86ab6e",
      state: `state${crypto.randomBytes(32).toString("hex")}`,
      nonce: `nonce${crypto.randomBytes(32).toString("hex")}`,
    }).toString();

    return res.redirect(url.toString());
  } catch (error) {
    next(error);
  }
}

//

export async function getCertificationDirigeantLoginAsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = await z.object({ code: z.string() }).parseAsync(req.query);
    const data = new URLSearchParams({
      grant_type: "authorization_code",
      redirect_uri: `http://localhost:3000/login-callback`,
      client_id:
        "211286433e39cce01db448d80181bdfd005554b19cd51b3fe7943f6b3b86ab6e",
      client_secret:
        "2791a731e6a59f56b6b4dd0d08c9b1f593b5f3658b9fd731cb24248e2669af4b",
      code: body.code,
    }).toString();
    const responseToken = await fetch(
      "https://fcp.integ01.dev-franceconnect.fr/api/v1/token",
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: data,
      },
    );

    const { access_token: accessToken, id_token: _idToken } = await z
      .object({
        access_token: z.string(),
        id_token: z.string(),
      })
      .parseAsync(await responseToken.json());

    const responseUserInfo = await fetch(
      "https://fcp.integ01.dev-franceconnect.fr/api/v1/userinfo",
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const { given_name, family_name } = await z
      .object({
        birthdate: z.string(),
        family_name: z.string(),
        gender: z.string(),
        given_name: z.string(),
        sub: z.string(),
      })
      .parseAsync(await responseUserInfo.json());

    // TODO(douglasduteil): handle FC logout
    // Should we directly logout from FC after this using the _idToken ?

    // TODO(douglasduteil): Redirect to another page to allow page reload / error notification
    // As the user can be redirected to the certification-dirigeant page and the code is onetime use only,
    // we should redirect to another page keeping the result of the FC userinfo request
    // Should we store the FranceConnect data in the session (for how long)?

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
    const schema = z.object({
      agreement: z.literal("on").optional(),
    });

    const { agreement } = await schema.parseAsync(req.body);

    if (agreement !== "on") {
      return res.redirect(
        "/users/certification-dirigeant/login-as?notification=certification_franceconnect_data_transmission_agreement_required",
      );
    }

    // TODO(douglasduteil): get the FranceConnect data from the session
    // Should we alter the the database with the FranceConnect data ?
    // Should we store if the user already FranceConnected in the database ?
    req.session.__user_certified = true;

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
