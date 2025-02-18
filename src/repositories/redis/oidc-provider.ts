// source https://github.com/panva/node-oidc-provider/blob/6fbcd71b08b8b8f381a97a82809de42c75904c6b/example/adapters/redis.js
import type { RedisOptions } from "ioredis";
import { isEmpty } from "lodash-es";
import { getNewRedisClient } from "../../connectors/redis";

const oidcRedisOptions: RedisOptions = {
  keyPrefix: "oidc:",
};
const getClient = () => getNewRedisClient(oidcRedisOptions);

const grantable = new Set([
  "AccessToken",
  "AuthorizationCode",
  "RefreshToken",
  "DeviceCode",
  "BackchannelAuthenticationRequest",
]);

const consumable = new Set([
  "AuthorizationCode",
  "RefreshToken",
  "DeviceCode",
  "BackchannelAuthenticationRequest",
]);

function grantKeyFor(id: any) {
  return `grant:${id}`;
}

function userCodeKeyFor(userCode: any) {
  return `userCode:${userCode}`;
}

function uidKeyFor(uid: any) {
  return `uid:${uid}`;
}

class RedisAdapter {
  name: any;
  constructor(name: any) {
    this.name = name;
  }

  async upsert(
    id: any,
    payload: { grantId: any; userCode: any; uid: any },
    expiresIn: number,
  ) {
    const key = this.key(id);
    const store = consumable.has(this.name)
      ? { payload: JSON.stringify(payload) }
      : JSON.stringify(payload);

    const multi = getClient().multi();
    // @ts-ignore
    multi[consumable.has(this.name) ? "hmset" : "set"](key, store);

    if (expiresIn) {
      multi.expire(key, expiresIn);
    }

    if (grantable.has(this.name) && payload.grantId) {
      const grantKey = grantKeyFor(payload.grantId);
      multi.rpush(grantKey, key);
      // if you're seeing grant key lists growing out of acceptable proportions consider using LTRIM
      // here to trim the list to an appropriate length
      const ttl = await getClient().ttl(grantKey);
      if (expiresIn > ttl) {
        multi.expire(grantKey, expiresIn);
      }
    }

    if (payload.userCode) {
      const userCodeKey = userCodeKeyFor(payload.userCode);
      multi.set(userCodeKey, id);
      multi.expire(userCodeKey, expiresIn);
    }

    if (payload.uid) {
      const uidKey = uidKeyFor(payload.uid);
      multi.set(uidKey, id);
      multi.expire(uidKey, expiresIn);
    }

    await multi.exec();
  }

  async find(id: any) {
    const data = consumable.has(this.name)
      ? await getClient().hgetall(this.key(id))
      : await getClient().get(this.key(id));

    if (isEmpty(data)) {
      return undefined;
    }

    if (typeof data === "string") {
      return JSON.parse(data);
    }
    // @ts-ignore
    const { payload, ...rest } = data;
    return {
      ...rest,
      ...JSON.parse(payload),
    };
  }

  async findByUid(uid: any) {
    const id = await getClient().get(uidKeyFor(uid));
    return this.find(id);
  }

  async findByUserCode(userCode: any) {
    const id = await getClient().get(userCodeKeyFor(userCode));
    return this.find(id);
  }

  async destroy(id: any) {
    const key = this.key(id);
    await getClient().del(key);
  }

  async revokeByGrantId(grantId: any) {
    const multi = getClient().multi();
    const tokens = await getClient().lrange(grantKeyFor(grantId), 0, -1);
    tokens.forEach((token: any) => multi.del(token));
    multi.del(grantKeyFor(grantId));
    await multi.exec();
  }

  async consume(id: any) {
    await getClient().hset(
      this.key(id),
      "consumed",
      Math.floor(Date.now() / 1000),
    );
  }

  key(id: any) {
    return `${this.name}:${id}`;
  }
}

export default RedisAdapter;
