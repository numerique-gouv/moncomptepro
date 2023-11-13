interface Moderation {
  id: number;
  user_id: number;
  organization_id: number;
  type:
    | 'big_organization_join'
    | 'organization_join_block'
    | 'non_verified_domain'
    | 'ask_for_sponsorship';
  created_at: Date;
  moderated_at: Date | null;
  comment: string | null;
}
