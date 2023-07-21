import { isEmpty } from 'lodash';
import { NextFunction, Request, Response } from 'express';
import { mustReturnOneOrganizationInPayload } from '../services/must-return-one-organization-in-payload';

export const interactionStartControllerFactory = (oidcProvider: any) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      uid: interactionId,
      params: { login_hint, scope },
      prompt,
    } = await oidcProvider.interactionDetails(req, res);

    req.session.interactionId = interactionId;
    req.session.mustReturnOneOrganizationInPayload = mustReturnOneOrganizationInPayload(
      scope
    );

    if (prompt.name === 'login') {
      if (!isEmpty(req.session.user)) {
        return res.redirect(`/interaction/${interactionId}/login`);
      }

      return res.redirect(
        `/users/start-sign-in${login_hint ? `?login_hint=${login_hint}` : ''}`
      );
    }

    return next(new Error(`unknown_interaction_name ${prompt.name}`));
  } catch (error) {
    return next(error);
  }
};

export const interactionEndControllerFactory = (oidcProvider: any) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    constructor: {
      errors: { SessionNotFound },
    },
  } = oidcProvider;

  try {
    const result = {
      login: {
        accountId: req.session.user!.id.toString(),
        acr: 'eidas1',
        amr: ['pwd'],
      },
    };

    req.session.interactionId = undefined;
    req.session.mustReturnOneOrganizationInPayload = undefined;

    await oidcProvider.interactionFinished(req, res, result);
  } catch (error) {
    if (error instanceof SessionNotFound) {
      // we may have taken to long to provide a session to the user since he has been redirected
      // we fail silently
      return res.redirect('/');
    }

    next(error);
  }
};
