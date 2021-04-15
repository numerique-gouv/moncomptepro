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
    type: 'info',
    message: `Vous souhaitez rejoindre une organisation existante.

Nous avons besoin de vérifier par nous-même que vous faites bien partie de cette organisation.
Vous recevrez un email dès que nous aurons terminé (délai moyen : 1 jour ouvré).

Si vous avez la moindre question, écrivez-nous à contact@api.gouv.fr`,
  },
  user_in_organization_already: {
    type: 'error',
    message: 'Vous appartenez déjà à cette organisation.',
  },
  email_unavailable: {
    type: 'warning',
    message: `Un compte existe déjà avec cet email.
      Cliquez sur "je me connecte" pour vous connecter.
      Si vous avez oublié votre mot de passe cliquez sur "je me connecte"
      puis sur "Mot de passe oublié ?".`,
  },
  email_verification_sent: {
    type: 'success',
    message: `Un nouveau code de confirmation vous a été envoyé.

La réception de ce code peut prendre jusqu’à 15 minutes.
Si vous n’avez rien reçu après ce délai, merci de vérifier votre boîte de SPAM.
Merci également de contacter votre hébergeur de mail en lui rapportant que les mails en provenance de contact@api.gouv.fr (adresse IP : 212.146.242.6) ne sont pas reçu.

Enfin, si vous avez essayé ces solutions et que vous ne recevez toujours pas le code, vous pouvez nous contacter à contact@api.gouv.fr`,
  },
  email_verified_already: {
    type: 'error',
    message: `Votre compte a déjà été confirmé.`,
  },
  invalid_verify_email_code: {
    type: 'error',
    message:
      'Le code de confirmation que vous avez utilisé est invalide ou expiré.',
  },
  weak_password: {
    type: 'error',
    message:
      'Votre mot de passe est trop court. Merci de choisir un mot de passe d’au moins 10 caractères.',
  },
  invalid_personal_informations: {
    type: 'error',
    message: 'Le format des informations personnelles est invalide.',
  },
};

export default notificationMessages;
