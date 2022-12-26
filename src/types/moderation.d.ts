interface Moderation {
  id: number;
  user_id: number;
  organization_id: number;
  type: string;
  created_at: Date;
  moderated_at: Date;
  as_external: boolean;
  comment: string | null;
}
