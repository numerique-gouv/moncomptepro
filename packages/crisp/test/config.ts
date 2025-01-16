//

import type { Config } from "#src/types";

export const config = {
  base_url: process.env.CRISP_BASE_URL!,
  debug: Boolean(process.env.DEBUG),
  identifier: process.env.CRISP_IDENTIFIER!,
  key: process.env.CRISP_KEY!,
  plugin_urn: process.env.CRISP_PLUGIN_URN as `urn:${string}`,
  user_nickname: process.env.CRISP_USER_NICKNAME!,
  website_id: process.env.CRISP_WEBSITE_ID!,
} satisfies Config;

export function defineConfig(input = config): Config {
  return input;
}
