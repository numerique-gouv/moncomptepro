import {
  getOrganizationSuggestions,
  getUserOrganization,
  getUserOrganizations,
  joinOrganization,
  quitOrganization,
} from '../managers/organization';
import notificationMessages from '../notification-messages';

export const getJoinOrganizationController = async (req, res, next) => {
  try {
    const notifications = notificationMessages[req.query.notification]
      ? [notificationMessages[req.query.notification]]
      : [];

    const { id: user_id, email } = req.session.user;

    const organizationSuggestions = await getOrganizationSuggestions({
      user_id,
      email,
    });

    return res.render('join-organization', {
      notifications,
      csrfToken: req.csrfToken(),
      siretHint: req.query.siret_hint,
      isExternalHint: req.query.is_external_hint,
      organizationSuggestions,
      disabled: req.query.notification === 'unable_to_auto_join_organization',
    });
  } catch (error) {
    next(error);
  }
};

export const postJoinOrganizationMiddleware = async (req, res, next) => {
  try {
    await joinOrganization({
      siret: req.body.siret,
      user_id: req.session.user.id,
      is_external: req.body.is_external === 'true',
    });

    next();
  } catch (error) {
    if (error.message === 'unable_to_auto_join_organization') {
      return res.redirect(
        `/users/join-organization?notification=${error.message}&siret_hint=${req.body.siret}`
      );
    }

    if (error.message === 'invalid_siret') {
      return res.redirect(
        `/users/join-organization?notification=${error.message}&siret_hint=${req.body.siret}`
      );
    }

    if (error.message === 'user_in_organization_already') {
      return res.redirect(
        `/users/join-organization?notification=${error.message}&siret_hint=${req.body.siret}`
      );
    }

    next(error);
  }
};

export const getManageOrganizationsController = async (req, res, next) => {
  try {
    const notifications = notificationMessages[req.query.notification]
      ? [notificationMessages[req.query.notification]]
      : [];

    const {
      userOrganizations,
      pendingUserOrganizations,
    } = await getUserOrganizations({ user_id: req.session.user.id });

    return res.render('manage-organizations', {
      notifications,
      userOrganizations,
      pendingUserOrganizations,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserOrganizationController = async (req, res, next) => {
  try {
    const notifications = notificationMessages[req.query.notification]
      ? [notificationMessages[req.query.notification]]
      : [];

    const organization = await getUserOrganization({
      user_id: req.session.user.id,
      organization_id: req.params.id,
    });

    return res.render('user-organization', {
      notifications,
      organization,
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    if (error.message === 'organization_not_found') {
      return res.redirect(
        `/users/manage-organizations?notification=${error.message}`
      );
    }

    next(error);
  }
};

export const postQuitUserOrganizationController = async (req, res, next) => {
  try {
    await quitOrganization({
      user_id: req.session.user.id,
      organization_id: req.params.id,
    });

    return res.redirect(
      `/users/manage-organizations?notification=quit_organization_success`
    );
  } catch (error) {
    next(error);
  }
};
