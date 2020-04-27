import { isEmpty } from 'lodash';

export const interactionStartControllerFactory = provider => async (
  req,
  res,
  next
) => {
  try {
    const { uid: interactionId, prompt } = await provider.interactionDetails(
      req
    );

    req.session.interactionId = interactionId;

    if (prompt.name === 'create_account') {
      return res.redirect(`/users/sign-up`);
    }

    if (prompt.name === 'login') {
      return res.redirect(`/users/sign-in`);
    }

    if (prompt.name === 'consent') {
      // Consent to share the user's data is implicitly given.
      // If consent is required, we redirect the user to the end of the login process
      // There, his consent will be accepted by default.
      if (!isEmpty(req.session.user)) {
        return res.redirect(`/interaction/${interactionId}/login`);
      }
      return res.redirect(`/users/sign-in`);
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
        account: req.session.user.id,
        acr: 'urn:mace:incommon:iap:bronze',
        amr: ['pwd'],
        ts: Math.floor(Date.now() / 1000),
        // Set the session cookie as persistent (vs transient) to limit the session duration to
        // the duration specified in oidc provider long cookie maxAge configuration.
        // Transient cookies can result in non expiring session as mentioned in
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#Session_cookies
        remember: true,
      },
      // We assume all oidc_clients can access the user data without asking for his consent.
      // So, we do not prompt the user for his consent, and we hard code the consent to all result here.
      consent: {
        rejectedScopes: [],
        rejectedClaims: [],
      },
      create_account: {},
    };

    req.session.interactionId = null;

    await provider.interactionFinished(req, res, result);
  } catch (error) {
    if (error instanceof SessionNotFound) {
      // we may have took to long to provide a session to the user since he has been redirected
      // we fail silently
      return res.redirect('https://api.gouv.fr/signup/api');
    }

    next(error);
  }
};
