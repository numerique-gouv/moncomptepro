//

import { hashToPostgresParams } from "#src/services";
import type { DatabaseContext, UserVerification } from "#src/types";

//

export function upsetUserVerificationLinkFactory({ pg }: DatabaseContext) {
  return async function upsetUserVerificationLink(
    value: Pick<UserVerification, "user_id" | "verification_type"> &
      Partial<UserVerification>,
  ) {
    const fieldsWithTimestamps = {
      ...value,
      updated_at: new Date(),
    };

    const { paramsString, valuesString, values } =
      hashToPostgresParams<UserVerification>(fieldsWithTimestamps);

    const { rows } = await pg.query<UserVerification>(
      `
      INSERT INTO users_verification
        ${paramsString}
      VALUES
        ${valuesString}
      ON CONFLICT (user_id)
        DO UPDATE
          SET ${paramsString} = ${valuesString}
      RETURNING *
    `,
      [...values],
    );

    return rows.shift()!;
  };
}

export type UpsetUserVerificationLinkHandler = ReturnType<
  typeof upsetUserVerificationLinkFactory
>;
