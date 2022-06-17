const notificationMessages = {
  invalid_credentials: {
    type: 'error',
    description: 'Mot de passe incorrect.',
  },
  invalid_email: {
    type: 'error',
    description: 'Adresse email invalide.',
  },
  invalid_siret: {
    type: 'error',
    description: 'SIRET invalide.',
  },
  invalid_token: {
    type: 'warning',
    description:
      'Le lien que vous avez utilisé est invalide ou expiré. Veuillez cliquer sur « Réinitialiser mon mot de passe » pour recevoir un nouveau lien',
  },
  password_change_success: {
    type: 'success',
    description:
      'Votre mot de passe a été mis à jour. Veuillez vous connecter avec votre nouveau mot de passe.',
  },
  reset_password_email_sent: {
    type: 'info',
    description: 'Vous allez recevoir un lien de réinitialisation par e-mail.',
  },
  unable_to_auto_join_organization: {
    type: 'info',
    description: `Vous souhaitez rejoindre une organisation existante.

Nous avons besoin de vérifier par nous-même que vous faites bien partie de cette organisation.
Vous recevrez un email dès que nous aurons terminé (délai moyen : 5 jours ouvrés).

Si vous avez la moindre question, écrivez-nous à contact@api.gouv.fr`,
  },
  user_in_organization_already: {
    type: 'error',
    description: 'Vous appartenez déjà à cette organisation.',
  },
  email_unavailable: {
    type: 'warning',
    description: `Un compte existe déjà avec cet email.
      Si vous avez oublié votre mot de passe cliquez sur « Mot de passe oublié ? ».`,
  },
  email_verification_sent: {
    type: 'success',
    description: `Un nouveau code de confirmation vous a été envoyé.

La réception de ce code peut prendre jusqu’à 15 minutes.
Si vous n’avez rien reçu après ce délai, merci de vérifier votre boîte de SPAM.
Merci également de contacter votre hébergeur de mail en lui rapportant que les mails en provenance de contact@api.gouv.fr (adresse IP : 212.146.242.6) ne sont pas reçu.

Enfin, si vous avez essayé ces solutions et que vous ne recevez toujours pas le code, vous pouvez nous contacter à contact@api.gouv.fr`,
  },
  email_verified_already: {
    type: 'error',
    description: `Votre compte a déjà été confirmé.`,
  },
  invalid_verify_email_code: {
    type: 'error',
    description:
      'Le code de confirmation que vous avez utilisé est invalide ou expiré.',
  },
  weak_password: {
    type: 'error',
    description:
      'Votre mot de passe est trop court. Merci de choisir un mot de passe d’au moins 10 caractères.',
  },
  invalid_personal_informations: {
    type: 'error',
    description: 'Le format des informations personnelles est invalide.',
  },
};

export default notificationMessages;
