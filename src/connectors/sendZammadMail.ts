//

import axios, { AxiosResponse } from "axios";
import path from "node:path";
import {
  DO_NOT_SEND_MAIL,
  MODERATION_TAG,
  ZAMMAD_TOKEN,
  ZAMMAD_URL,
} from "../config/env";
import { render } from "../services/renderer";

//

const CLOSED_STATE_ID = "4";
const CREATE_TICKET_ENDPOINT = `${ZAMMAD_URL}/api/v1/tickets`;
const EMAIL_TYPE_ID = 1;
const GROUP_MONCOMPTEPRO = "MonComptePro";
const GROUP_MONCOMPTEPRO_SENDER_ID = 1;
const NORMAL_PRIORITY_ID = "1";

//

export async function sendZammadMail({
  to,
  subject,
  template,
  params,
}: {
  to: string;
  subject: string;
} & LocalTemplate) {
  const body = await render(
    path.resolve(`${__dirname}/../views/mails/${template}.ejs`),
    params,
  );

  const data = {
    title: subject,
    group: GROUP_MONCOMPTEPRO,
    customer_id: `guess:${to}`,
    state_id: CLOSED_STATE_ID,
    priority_id: NORMAL_PRIORITY_ID,
    article: {
      from: GROUP_MONCOMPTEPRO,
      to,
      body,
      type_id: EMAIL_TYPE_ID,
      sender_id: GROUP_MONCOMPTEPRO_SENDER_ID,
      content_type: "text/html",
    },
    tags: [MODERATION_TAG, template].join(","),
  };

  if (DO_NOT_SEND_MAIL) {
    console.log(`${template} mail not send to ${to}:`);
    console.log(data);
    return { id: null };
  }

  const { data: ticket }: AxiosResponse<{ id: number }> = await axios.post(
    CREATE_TICKET_ENDPOINT,
    data,
    {
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${ZAMMAD_TOKEN}`,
      },
    },
  );

  return ticket;
}

//

type LocalTemplate = {
  template: "unable-to-auto-join-organization";
  params: { libelle: string };
};
