interface User {
  id: number;
  email: string;
  encrypted_password: string | null;
  reset_password_token: string | null;
  reset_password_sent_at: Date | null;
  sign_in_count: number;
  last_sign_in_at: Date | null;
  created_at: Date;
  updated_at: Date;
  legacy_user: boolean;
  email_verified: boolean;
  verify_email_token: string | null;
  verify_email_sent_at: Date | null;
  given_name: string | null;
  family_name: string | null;
  phone_number: string | null;
  job: string | null;
  magic_link_token: string | null;
  magic_link_sent_at: Date | null;
  email_verified_at: Date | null;
  has_been_greeted_for_first_organization_join: boolean;
}
