import { isEmpty } from 'lodash';

export const interactionStartControllerFactory = provider => async (
  req,
  res,
  next
) => {
  try {
    const { uid: interactionId, prompt } = await provider.interactionDetails(
      req,
      res
    );

    req.session.interactionId = interactionId;

    if (prompt.name === 'login') {
      if (!isEmpty(req.session.user)) {
        return res.redirect(`/interaction/${interactionId}/login`);
      }

      return res.redirect(`/users/start-sign-in`);
    }

    return res.status(500).render('error', {
      error_code: 'unknown_interaction_name',
      error_message: prompt.name,
    });
  } catch (error) {
    return next(error);
  }
};

export const interactionEndControllerFactory = provider => async (
  req,
  res,
  next
) => {
  const {
    constructor: {
      errors: { SessionNotFound },
    },
  } = provider;

  try {
    const result = {
      login: {
        accountId: req.session.user.id.toString(),
        acr: 'urn:mace:incommon:iap:bronze',
        amr: ['pwd'],
        ts: Math.floor(Date.now() / 1000),
        // Set the session cookie as persistent (vs transient) to limit the session duration to
        // the duration specified in oidc provider long cookie maxAge configuration.
        // Transient cookies can result in non expiring session as mentioned in
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#Session_cookies
        remember: true,
      },
    };

    req.session.interactionId = null;

    await provider.interactionFinished(req, res, result);
  } catch (error) {
    if (error instanceof SessionNotFound) {
      // we may have took to long to provide a session to the user since he has been redirected
      // we fail silently
      return res.redirect('/');
    }

    next(error);
  }
};
