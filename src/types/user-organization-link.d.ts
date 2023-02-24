interface UserOrganizationLink {
  user_id: number;
  organization_id: number;
  is_external: boolean;
  created_at: Date;
  updated_at: Date;
  verification_type: string;
}
