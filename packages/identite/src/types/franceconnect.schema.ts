//

import { z } from "zod";

//

/**
 * @see https://docs.partenaires.franceconnect.gouv.fr/fs/fs-technique/fs-technique-scope-fc/#liste-des-claims
 */
export const FranceConnectUserInfoSchema = z.object({
  birthdate: z.string(),
  birthplace: z.string(),
  family_name: z.string(),
  gender: z.string(),
  given_name: z.string(),
});

export type FranceConnectUserInfo = z.infer<typeof FranceConnectUserInfoSchema>;
