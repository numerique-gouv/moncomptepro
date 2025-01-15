//

import { fetch_crisp } from "#src/client/fetcher.js";
import type { Config } from "#src/types";
import { defineConfig } from "#test/config";
import { expect } from "#test/expect";
import { test } from "mocha";
import type {
  GetConversationRoute,
  GetMessagesInAConversationRoute,
  SendMessageInAConversationRoute,
  UpdateConversationMetaRoute,
  UpdateConversationStateRoute,
} from "./conversation.js";

//

test("create a new conversation", async () => {
  const config = defineConfig();
  const conversation = await fetch_crisp(config, {
    endpoint: `/v1/website/${config.website_id}/conversation`,
    method: "POST",
    searchParams: {},
  });

  expect(conversation).toEqual({
    session_id: expect.stringContaining("session_"),
  });
  {
    const response = await delete_conversation(config, conversation.session_id);
    expect(response).toEqual({});
  }
});

test("change conversation state", async () => {
  const config = defineConfig();
  const conversation = await fetch_crisp(config, {
    endpoint: `/v1/website/${config.website_id}/conversation`,
    method: "POST",
    searchParams: {},
  });

  {
    const response = await fetch_crisp(config, {
      endpoint: `/v1/website/${config.website_id}/conversation/${conversation.session_id}/state`,
      method: "GET",
      searchParams: {},
    });
    expect(response).toEqual({
      state: "pending",
    });
  }

  {
    const response = await fetch_crisp<UpdateConversationStateRoute>(config, {
      endpoint: `/v1/website/${config.website_id}/conversation/${conversation.session_id}/state`,
      method: "PATCH",
      searchParams: {},
      body: { state: "resolved" },
    });

    expect(response).toEqual({});
  }

  {
    const response = await fetch_crisp(config, {
      endpoint: `/v1/website/${config.website_id}/conversation/${conversation.session_id}/state`,
      method: "GET",
      searchParams: {},
    });
    expect(response).toEqual({
      state: "resolved",
    });
  }

  await delete_conversation(config, conversation.session_id);
});

test("send a message", async () => {
  const config = defineConfig();
  const conversation = await fetch_crisp(config, {
    endpoint: `/v1/website/${config.website_id}/conversation`,
    method: "POST",
    searchParams: {},
  });

  {
    // Default meta
    const response = await fetch_crisp(config, {
      endpoint: `/v1/website/${config.website_id}/conversation/${conversation.session_id}/meta`,
      method: "GET",
      searchParams: {},
    });

    expect(response).toEqual({
      avatar: "",
      data: {},
      device: { geolocation: {} },
      email: "",
      ip: expect.any(String),
      nickname: "anonymous",
      phone: "",
      segments: ["chat"],
    });
  }

  {
    const response = await fetch_crisp<UpdateConversationMetaRoute>(config, {
      endpoint: `/v1/website/${config.website_id}/conversation/${conversation.session_id}/meta`,
      method: "PATCH",
      searchParams: {},
      body: {
        email: "frodon.sacquet@theshire.middle-earth.com",
        nickname: "Frodon Sacquet",
        segments: ["email", "test"],
        subject: "Le Mordor Gandalf, c’est à gauche ou à droite ?",
      },
    });

    expect(response).toEqual({});
  }

  {
    const response = await fetch_crisp<SendMessageInAConversationRoute>(
      config,
      {
        endpoint: `/v1/website/${config.website_id}/conversation/${conversation.session_id}/message`,
        method: "POST",
        searchParams: {},
        body: {
          type: "text",
          origin: `urn:${config.website_id}`,
          from: "operator",
          content:
            "Nous sommes des amis de Gandhalf le gris. Pouvez-vous nous annoncer à lui ?",
          user: { nickname: "Frodon Sacquet" },
        },
      },
    );

    expect(response).toEqual({
      fingerprint: expect.any(Number),
    });
  }

  // HACK(douglasduteil): wait for the actual api to react to the changes
  await new Promise((resolve) => setTimeout(resolve, 222));

  {
    const response = await fetch_crisp<GetConversationRoute>(config, {
      endpoint: `/v1/website/${config.website_id}/conversation/${conversation.session_id}`,
      method: "GET",
      searchParams: {},
    });

    expect(response).toMatchObject({
      created_at: expect.any(Number),
      last_message:
        "Nous sommes des amis de Gandhalf le gris. Pouvez-vous nous annoncer à lui ?",
      meta: {
        email: "frodon.sacquet@theshire.middle-earth.com",
        nickname: "Frodon Sacquet",
      },
    });
  }
  {
    const response = await fetch_crisp<GetMessagesInAConversationRoute>(
      config,
      {
        endpoint: `/v1/website/${config.website_id}/conversation/${conversation.session_id}/messages`,
        method: "GET",
        searchParams: {},
      },
    );

    expect(response).toMatchObject([
      {
        content:
          "Nous sommes des amis de Gandhalf le gris. Pouvez-vous nous annoncer à lui ?",
        delivered: "",
        fingerprint: expect.any(Number),
        from: "operator",
        mentions: [],
        origin: `urn:${config.website_id}`,
        preview: [],
        read: "",
        session_id: conversation.session_id,
        stamped: true,
        timestamp: expect.any(Number),
        type: "text",
        user: {
          nickname: "Frodon Sacquet",
        },
        website_id: config.website_id,
      },
    ]);
  }

  await delete_conversation(config, conversation.session_id);
});

function delete_conversation(config: Config, session_id: string) {
  return fetch_crisp(config, {
    endpoint: `/v1/website/${config.website_id}/conversation/${session_id}`,
    method: "DELETE",
    searchParams: {},
  });
}
