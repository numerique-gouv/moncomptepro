import {
  findByClientId,
  getByUserIdOrderedByConnectionCount,
  upsertAndIncrementConnectionCount,
} from '../repositories/oidc-client';
import { isEmpty } from 'lodash';
import { NotFoundError } from '../errors';

export const getClientsOrderedByConnectionCount = async (
  user_id: number
): Promise<OidcClient[]> => {
  return await getByUserIdOrderedByConnectionCount(user_id);
};

export const incrementConnectionCount = async (
  user_id: number,
  client_id: string
): Promise<null> => {
  const oidc_client = await findByClientId(client_id);

  if (isEmpty(oidc_client)) {
    throw new NotFoundError();
  }

  await upsertAndIncrementConnectionCount(user_id, oidc_client.id);

  return null;
};
