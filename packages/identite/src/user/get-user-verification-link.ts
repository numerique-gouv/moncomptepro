//

import type { DatabaseContext, UserVerification } from "#src/types";
import { type QueryResult } from "pg";

//

export function getUserVerificationLinkFactory({ pg }: DatabaseContext) {
  return async function upsetUserVerificationLink(user_id: number) {
    const { rows }: QueryResult<UserVerification> = await pg.query(
      `
      SELECT *
      FROM users_verification
      WHERE user_id = $1
      `,
      [user_id],
    );

    return rows.shift();
  };
}

export type GetUserVerificationLinkHandler = ReturnType<
  typeof getUserVerificationLinkFactory
>;
