interface BaseUserOrganizationLink {
  is_external: boolean;
  verification_type:
    | 'verified_email_domain'
    | 'official_contact_email'
    | 'official_contact_domain'
    | 'code_send_to_organization'
    | null;
  authentication_by_peers_type:
    | 'all_members_notified'
    | 'sponsored_by_member'
    | null;
  has_been_greeted: boolean;
  sponsor_id: number | null;
}

interface UserOrganizationLink extends BaseUserOrganizationLink {
  user_id: number;
  organization_id: number;
  created_at: Date;
  updated_at: Date;
}
