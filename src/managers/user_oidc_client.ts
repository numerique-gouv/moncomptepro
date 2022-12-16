import { upsertAndIncrementCount } from '../repositories/user_oidc_client';
import { findByClientId } from '../repositories/oidc-client';

export const incrementConnectionCount = async (
  user_id: number,
  client_id: string
) => {
  let count = null;

  try {
    const { id: oidc_client_id } = await findByClientId(client_id);

    if (oidc_client_id) {
      const { connection_count } = await upsertAndIncrementCount(
        user_id,
        oidc_client_id
      );

      count = connection_count;
    }

    return count;
  } catch (error) {
    console.error(error);

    // fails silently
    return count;
  }
};
