import {
  findByClientId,
  getByUserIdOrderedByConnectionCount,
  upsertAndIncrementConnectionCount,
} from '../repositories/oidc-client';

export const getClientsOrderedByConnectionCount = async (
  user_id: number
): Promise<OidcClient[]> => {
  return await getByUserIdOrderedByConnectionCount(user_id);
};

export const incrementConnectionCount = async (
  user_id: number,
  client_id: string
): Promise<number | null> => {
  const oidc_client = await findByClientId(client_id);

  if (!oidc_client?.id) {
    console.error(
      `Unable to increment connection count. Client not found for id:${client_id}`
    );
    // fails silently
    return null;
  }

  const { connection_count } = await upsertAndIncrementConnectionCount(
    user_id,
    oidc_client.id
  );

  return connection_count;
};
