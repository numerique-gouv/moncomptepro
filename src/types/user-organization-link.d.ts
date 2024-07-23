interface BaseUserOrganizationLink {
  is_external: boolean;
  verification_type:
    | "code_sent_to_official_contact_email"
    | "domain"
    | "imported_from_inclusion_connect"
    | "in_liste_dirigeants_rna"
    | "no_validation_means_available"
    | "no_verification_means_for_entreprise_unipersonnelle"
    | "official_contact_email"
    | "verified_contact_email"
    | null;
  verified_at: Date | null;
  authentication_by_peers_type:
    | "all_members_notified"
    | "sponsored_by_member"
    | "is_the_only_active_member"
    | "deactivated_by_whitelist"
    | "deactivated_by_gouv_fr_domain"
    | "deactivated_by_import"
    | null;
  has_been_greeted: boolean;
  sponsor_id: number | null;
  needs_official_contact_email_verification: boolean;
  official_contact_email_verification_token: string | null;
  official_contact_email_verification_sent_at: Date | null;
}

interface UserOrganizationLink extends BaseUserOrganizationLink {
  user_id: number;
  organization_id: number;
  created_at: Date;
  updated_at: Date;
}
