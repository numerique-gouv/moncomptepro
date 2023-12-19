import { getNewRedisClient } from "../../connectors/redis";
import { SESSION_MAX_AGE_IN_SECONDS } from "../../config/env";

const redisClient = getNewRedisClient({
  keyPrefix: "mcp:selected-organization:",
});

export const getSelectedOrganizationId = async (user_id: number) => {
  const rawResult = await redisClient.get(user_id.toString());
  return rawResult === null ? null : parseInt(rawResult, 10);
};

export const setSelectedOrganizationId = async (
  user_id: number,
  selectedOrganization: number,
) => {
  await redisClient.setex(
    user_id.toString(),
    SESSION_MAX_AGE_IN_SECONDS,
    selectedOrganization,
  );
};

export const deleteSelectedOrganizationId = async (user_id: number) => {
  await redisClient.del(user_id.toString());
};
