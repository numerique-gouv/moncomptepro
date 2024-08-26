interface EmailDomain {
  id: number;
  organization_id: number;
  domain: string;
  verification_type: // rk: domaine autorisé : ajout en interne, ne génèrera pas de modération en cas de création de compte (y compris trackdechet)
  // :negative_squared_cross_mark: domaine externe : ajout en externe, ne génèrera pas de modération en cas de création de compte. En date du 18/08/24, cela n’a pas encore d’incidence sur le fonctionnement de MCP
  // :no_entry_sign: domaine refusé : sort de la to do vérification de nom de domaine. Une modération sera créée en cas de création de compte. N’impacte pas les comptes déjà créés.
  // :skull_and_crossbones: domaine blacklisté (ce nom de domaine est refusé pour cette organisation + contacter le support si cette situation vous semble anormale) : domaine refusé et ne créera pas de modération. Exemple : @total.fr pour rejoindre la DINUM. Cette dernière action est moins importante
  | "verified"
    | "blacklisted" // TODO user should not generate new moderation with theses emails but afficher un écran
    | "refused" // TODO 20/80 : permet de marquer les vérifications pour une repasse ultérieur, même comportement que si le domaine est inconnu de MCP (création de modération bloquante)
    | "official_contact"
    | "external"
    | "trackdechets_postal_mail"
    | null;
  // TODO should block suggestion if false
  can_be_suggested: boolean;
  // updated when verification_type is changed
  verified_at: Date | null;
  created_at: Date;
  updated_at: Date;
}
