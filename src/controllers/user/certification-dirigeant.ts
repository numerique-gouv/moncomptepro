//

import type { NextFunction, Request, Response } from "express";
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
    return res.redirect("/users/certification-dirigeant/login-as");
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
    return res.render("user/certification-dirigeant-login-as", {
      csrfToken: csrfToken(req),
      notifications: await getNotificationsFromRequest(req),
      pageTitle: "Se connecter en tant que",
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

    console.log({ agreement });
    req.session.__user_certified = true;
    // return res.redirect("/users/sign-in");
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
