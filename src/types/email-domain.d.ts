interface EmailDomain {
  id: number;
  organization_id: number;
  domain: string;
  verification_type:
    | "verified"
    | "blacklisted"
    | "official_contact"
    | "temporary"
    | "external"
    | "trackdechets_postal_mail";
  can_be_suggested: boolean;
  verified_at: Date | null;
  created_at: Date;
  updated_at: Date;
}
