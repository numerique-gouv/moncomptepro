import { isEmpty } from 'lodash';

export const interactionStartControllerFactory = oidcProvider => async (
  req,
  res,
  next
) => {
  try {
    const {
      uid: interactionId,
      params: { login_hint },
      prompt,
    } = await oidcProvider.interactionDetails(req, res);

    req.session.interactionId = interactionId;

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

export const interactionEndControllerFactory = oidcProvider => async (
  req,
  res,
  next
) => {
  const {
    constructor: {
      errors: { SessionNotFound },
    },
  } = oidcProvider;

  try {
    const result = {
      login: {
        accountId: req.session.user.id.toString(),
        acr: 'urn:mace:incommon:iap:bronze',
        amr: ['pwd'],
        // Set the session cookie as persistent (vs transient) to limit the session duration to
        // the duration specified in oidc provider long cookie maxAge configuration.
        // Transient cookies can result in non expiring session as mentioned in
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#Session_cookies
      },
    };

    req.session.interactionId = null;

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
