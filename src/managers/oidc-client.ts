import {
  findByClientId,
  getByUserIdOrderedByConnectionCount,
  addConnection,
} from '../repositories/oidc-client';
import { isEmpty } from 'lodash';
import { NotFoundError } from '../errors';

export const getClientsOrderedByConnectionCount = async (
  user_id: number
): Promise<OidcClient[]> => {
  return await getByUserIdOrderedByConnectionCount(user_id);
};

export const recordNewConnection = async (
  user_id: number,
  client_id: string
): Promise<Connection> => {
  const oidc_client = await findByClientId(client_id);

  if (isEmpty(oidc_client)) {
    throw new NotFoundError();
  }

  return await addConnection(user_id, oidc_client.id);
};
