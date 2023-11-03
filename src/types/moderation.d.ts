interface BaseModeration {
  user_id: number;
  organization_id: number;
  type:
    | 'organization_join_block'
    | 'non_verified_domain'
    | 'ask_for_sponsorship';
  origin: string | null;
}

interface Moderation extends BaseModeration {
  id: number;
  created_at: Date;
  moderated_at: Date | null;
  comment: string | null;
}
