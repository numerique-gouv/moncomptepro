import {
  getByUserIdOrderedByCount,
  upsertAndIncrementCount,
  UserOidcClient,
} from '../repositories/user_oidc_client';
import { findByClientId } from '../repositories/oidc-client';

export const getClientsOrderedByConnectionCount = async (
  user_id: number
): Promise<UserOidcClient[]> => {
  return await getByUserIdOrderedByCount(user_id);
};

export const incrementConnectionCount = async (
  user_id: number,
  client_id: string
): Promise<number | null> => {
  const oidc_client = await findByClientId(client_id);

  if (!oidc_client?.id) {
    // fails silently
    return null;
  }

  const { connection_count } = await upsertAndIncrementCount(
    user_id,
    oidc_client.id
  );

  return connection_count;
};
