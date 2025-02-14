//

import { z } from "zod";

//

export const UserVerificationTypeSchema = z.enum(["franceconnect"]);
export type UserVerificationType = z.output<typeof UserVerificationTypeSchema>;

//

export interface UserVerification {
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly user_id: number;
  verified_at: Date | null;
  verification_type: UserVerificationType;
}
