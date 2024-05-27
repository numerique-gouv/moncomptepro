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
  current_challenge: string | null;
  needs_inclusionconnect_welcome_page: boolean;
  needs_inclusionconnect_onboarding_help: boolean;
  encrypted_totp_key: string | null;
  totp_key_verified_at: Date | null;
}
