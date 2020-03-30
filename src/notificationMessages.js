const notificationMessages = {
  invalid_credentials: {
    type: 'error',
    message: 'Email ou mot de passe incorrect.',
  },
  invalid_email: {
    type: 'error',
    message: 'Adresse email invalide.',
  },
  invalid_siret: {
    type: 'error',
    message: 'SIRET invalide.',
  },
  invalid_token: {
    type: 'warning',
    message: 'Le lien que vous avez utilisé est invalide ou expiré.',
  },
  password_change_success: {
    type: 'success',
    message:
      'Votre mot de passe a été mis à jour. Veuillez vous connecter avec votre nouveau mot de passe.',
  },
  passwords_do_not_match: {
    type: 'error',
    message: 'Les mots de passe ne correspondent pas.',
  },
  reset_password_email_sent: {
    type: 'info',
    message: 'Vous allez recevoir un lien de réinitialisation par e-mail.',
  },
  unable_to_auto_join_organization: {
    type: 'warning',
    message: `Nous ne sommes pas en mesure de traiter votre demande automatiquement.
      Pour rejoindre cette organisation, merci de nous transmettre une demande
      écrite à l'adresse contact@api.gouv.fr.`,
  },
  user_in_organization_already: {
    type: 'error',
    message: 'Vous appartenez déjà à cette organisation.',
  },
  organization_needed: {
    type: 'warning',
    message: `Pour continuer, merci de renseigner le numéro SIRET de l'organisation que
      vous représentez.`,
  },
  signup_step2: {
    type: 'info',
    message: `Afin de compléter votre inscription, merci de renseigner le numéro SIRET de
      l'organisation que vous représentez.`,
  },
  email_unavailable: {
    type: 'warning',
    message: `Un compte existe déjà avec cet email.
      Cliquez sur "je me connecte" pour vous connecter.
      Si vous avez oublié votre mot de passe cliquez sur "je me connecte"
      puis sur "Mot de passe oublié ?".`,
  },
  email_verification_required: {
    type: 'info',
    message: `Vous devez activer votre compte avant de continuer.
      Pour cela cliquez sur le lien d'activation que vous avez reçu par mail.`,
  },
  email_verification_sent: {
    type: 'success',
    message: "Un email d'activation de votre compte vous a été envoyé.",
  },
  email_verified_already: {
    type: 'error',
    message: `Votre compte est déjà activé.`,
  },
  verify_email_success: {
    type: 'success',
    message: 'Votre compte a été activé avec succès.',
  },
  weak_password: {
    type: 'error',
    message:
      "Votre mot de passe est trop court. Merci de choisir un mot de passe d'au moins 10 caractères",
  },
};

export default notificationMessages;
