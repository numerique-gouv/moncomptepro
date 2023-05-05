interface Moderation {
  id: number;
  user_id: number;
  organization_id: number;
  type: 'organization_join_block' | 'non_verified_domain';
  created_at: Date;
  moderated_at: Date;
  comment: string | null;
}
