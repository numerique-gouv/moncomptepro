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
    | null;
  // updated when verification_type is changed
  verified_at: Date | null;
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
