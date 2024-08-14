//

import { fetch_crisp, type Config } from "@numerique-gouv/crisp";
import {
  CreateConversationRoute,
  SendMessageInAConversationRoute,
  UpdateConversationMetaRoute,
  UpdateConversationStateRoute,
} from "@numerique-gouv/crisp/router/conversation";
import {
  CRISP_BASE_URL,
  CRISP_IDENTIFIER,
  CRISP_KEY,
  CRISP_PLUGIN_URN,
  CRISP_USER_NICKNAME,
  CRISP_WEBSITE_ID,
} from "../config/env";

//

const config: Config = {
  base_url: CRISP_BASE_URL,
  identifier: CRISP_IDENTIFIER || "",
  key: CRISP_KEY || "",
  plugin_urn: CRISP_PLUGIN_URN || "",
  user_nickname: CRISP_USER_NICKNAME,
  website_id: CRISP_WEBSITE_ID || "",
  debug: true,
};
//

export async function start_crips_conversation({
  content,
  email,
  nickname,
  subject,
}: {
  content: string;
  email: string;
  nickname: string;
  subject: string;
}) {
  const { session_id } = await fetch_crisp<CreateConversationRoute>(config, {
    endpoint: `/v1/website/${config.website_id}/conversation`,
    method: "POST",
    searchParams: {},
  });

  await fetch_crisp<UpdateConversationMetaRoute>(config, {
    endpoint: `/v1/website/${config.website_id}/conversation/${session_id}/meta`,
    method: "PATCH",
    searchParams: {},
    body: {
      email,
      nickname,
      segments: ["email", "moderation"],
      subject,
    },
  });

  await fetch_crisp<SendMessageInAConversationRoute>(config, {
    endpoint: `/v1/website/${config.website_id}/conversation/${session_id}/message`,
    method: "POST",
    searchParams: {},
    body: {
      type: "text",
      origin: `urn:${config.website_id}`,
      from: "operator",
      content,
      user: {},
    },
  });

  await fetch_crisp<UpdateConversationStateRoute>(config, {
    endpoint: `/v1/website/${config.website_id}/conversation/${session_id}/state`,
    method: "PATCH",
    searchParams: {},
    body: { state: "resolved" },
  });

  return session_id;
}
