interface NotificationMessages {
  [key: string]: {
    type: string;
    description: string;
  };
}

const notificationMessages: NotificationMessages = {
  invalid_credentials: {
    type: "error",
    description: "Erreur : mot de passe incorrect.",
  },
  invalid_email: {
    type: "error",
    description: "Erreur : adresse email invalide.",
  },
  invalid_siret: {
    type: "error",
    description: "Erreur : SIRET invalide.",
  },
  insee_unexpected_error: {
    type: "error",
    description:
      "Erreur : les données INSEE de l’organisation, nécessaires pour valider le rattachement, sont indisponibles pour le moment. Merci de réessayer ultérieurement.",
  },
  invalid_token: {
    type: "warning",
    description: `Attention : le lien que vous avez utilisé est invalide ou expiré.

Veuillez cliquer sur « Réinitialiser » pour recevoir un nouveau lien`,
  },
  invalid_magic_link: {
    type: "warning",
    description:
      "Attention : le lien que vous avez utilisé est invalide ou expiré.",
  },
  password_change_success: {
    type: "success",
    description: `Votre mot de passe a été mis à jour.

Veuillez vous connecter avec votre nouveau mot de passe.`,
  },
  reset_password_email_sent: {
    type: "info",
    description:
      "Information : vous allez recevoir un lien de réinitialisation par e-mail.",
  },
  user_in_organization_already: {
    type: "error",
    description: "Erreur : vous appartenez déjà à cette organisation.",
  },
  email_unavailable: {
    type: "warning",
    description: `Attention : un compte existe déjà avec cet email.

Si vous avez oublié votre mot de passe cliquez sur « Mot de passe oublié ? ».`,
  },
  email_verified_already: {
    type: "error",
    description: `Erreur : votre email a déjà été vérifié.`,
  },
  invalid_verify_email_code: {
    type: "error",
    description:
      "Erreur : le code de vérification que vous avez utilisé est invalide ou expiré.",
  },
  email_verification_renewal: {
    type: "info",
    description:
      "Information : pour garantir la sécurité de votre compte, votre adresse email doit être vérifiée régulièrement.",
  },
  login_required: {
    type: "info",
    description:
      "Information : pour garantir la sécurité de votre compte, merci de vous identifier à nouveau.",
  },
  browser_not_trusted: {
    type: "info",
    description:
      "Information : pour garantir la sécurité de votre compte, nous avons besoin d’authentifier votre navigateur.",
  },
  weak_password: {
    type: "error",
    description:
      "Erreur : votre mot de passe est trop faible. Merci de choisir un mot de passe qui complète les exigences affichées.",
  },
  leaked_password: {
    type: "error",
    description:
      "Erreur : il semble que ce mot de passe soit trop commun. Pour des raisons de sécurité, merci d’en choisir un autre.",
  },
  invalid_personal_informations: {
    type: "error",
    description:
      "Erreur : le format des informations personnelles est invalide.",
  },
  quit_organization_success: {
    type: "success",
    description: "Vous ne faites désormais plus partie de cette organisation.",
  },
  cancel_moderation_success: {
    type: "success",
    description: "Votre demande de rattachement a bien été annulée.",
  },
  logout_success: {
    type: "info",
    description: "Information : vous êtes maintenant déconnecté.",
  },
  personal_information_update_success: {
    type: "success",
    description: "Vos informations ont été mises à jour.",
  },
  official_contact_email_verification_not_needed: {
    type: "error",
    description:
      "Erreur : votre appartenance à l’organisation n’a plus besoin d’être vérifiée.",
  },
  api_annuaire_error: {
    type: "error",
    description:
      "Erreur : les données Annuaire Service Public de l’organisation, nécessaires pour valider le rattachement, sont indisponibles pour le moment. Merci de réessayer ultérieurement.",
  },
  passkey_successfully_created: {
    type: "success",
    description:
      "Tout est en ordre ! Vous pouvez désormais utiliser votre empreinte, votre visage ou le verrouillage de l'écran pour vous connecter sur cet appareil.",
  },
  passkey_successfully_deleted: {
    type: "success",
    description: "Votre clé d’accès a bien été supprimée.",
  },
  passkey_not_found: {
    type: "error",
    description: "Erreur : nous n’avons pas trouvé votre clé d’accès.",
  },
  invalid_passkey: {
    type: "error",
    description: "Erreur : votre clé d’accès est invalide.",
  },
  user_successfully_deleted: {
    type: "success",
    description: "Ah que salut 💔",
  },
};

export default notificationMessages;
