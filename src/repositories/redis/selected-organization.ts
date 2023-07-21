import { getNewRedisClient } from '../../connectors/redis';

const redisClient = getNewRedisClient({
  keyPrefix: 'mcp:selected-organization:',
});

export const getSelectedOrganizationId = async (accountId: number) => {
  const rawResult = await redisClient.get(accountId.toString());
  return rawResult === null ? null : parseInt(rawResult, 10);
};

export const setSelectedOrganizationId = async (
  accountId: number,
  selectedOrganization: number
) => {
  await redisClient.set(accountId.toString(), selectedOrganization);
};
