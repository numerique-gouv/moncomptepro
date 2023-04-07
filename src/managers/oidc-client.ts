import {
  findByClientId,
  getByUserIdOrderedByConnectionCount,
  addConnection,
  findById as findOidcClientById,
  getConnectionCount,
} from '../repositories/oidc-client';
import { isEmpty } from 'lodash';
import { NotFoundError } from '../errors';
import { findById as findUserById } from '../repositories/user';
import {
  getOrganizationsByUserId,
  notifyOrganizationMemberForFirstConnection,
} from './organization';

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

export const sendFirstConnectionNotifications = async (
  { oidc_client_id, user_id }: Connection,
  scopeGranted?: string
) => {
  if (!scopeGranted?.includes('organizations')) {
    // we assume we must notify users of this client in these organizations only if
    // organization info is transmitted to the client.
    return null;
  }

  const user = await findUserById(user_id);
  const oidc_client = await findOidcClientById(oidc_client_id);
  if (isEmpty(user) || isEmpty(oidc_client)) {
    throw new NotFoundError();
  }

  const connectionCount = await getConnectionCount(user_id, oidc_client_id);
  if (connectionCount !== 1) {
    // TODO connectionCount can be higher than one if a user already connect with other organization
    // Notify users only for first connection
    return null;
  }

  const userOrganizations = await getOrganizationsByUserId(user_id);
  await Promise.all(
    userOrganizations.map(async organization => {
      await notifyOrganizationMemberForFirstConnection(
        organization,
        user,
        oidc_client
      );
    })
  );
};
