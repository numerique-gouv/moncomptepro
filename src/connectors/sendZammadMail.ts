//

import { sampleSize } from "lodash";
import path from "node:path";
import { DO_NOT_SEND_MAIL, ZAMMAD_TOKEN, ZAMMAD_URL } from "../config/env";
import { render } from "../services/renderer";
import { LocalTemplateSlug } from "./sendinblue";

//

const CLOSED_STATE_ID = "4";
const CREATE_TICKET_ENDPOINT = `${ZAMMAD_URL}/api/v1/tickets`;
const EMAIL_TYPE_ID = 1;
const FROM_MON_COMPTE_PRO = "MonComptePro";
const GROUP_MON_COMPTE_PRO = "MonComptePro";
const GROUP_MON_COMPTE_PRO_SENDER_ID = 1;
const MODERATION_TAG = "moderation";
const NORMAL_PRIORITY_ID = "1";

//

export async function sendZammadMail({
  to = [],
  cc = [],
  subject,
  template,
  params,
  senderEmail = "moncomptepro@beta.gouv.fr",
}: {
  to: string[];
  cc?: string[];
  subject: string;
  template: LocalTemplateSlug;
  params: any;
  senderEmail?: string;
}) {
  const body = await render(
    path.resolve(`${__dirname}/../views/mails/${template}.ejs`),
    params,
  );

  const data = {
    title: subject,
    group: GROUP_MON_COMPTE_PRO,
    customer_id: `guess:${to.at(0)}`,
    state_id: CLOSED_STATE_ID,
    priority_id: NORMAL_PRIORITY_ID,
    article: {
      from: GROUP_MON_COMPTE_PRO,
      to: sampleSize(to, 99).join(","),
      body,
      type_id: EMAIL_TYPE_ID,
      sender_id: GROUP_MON_COMPTE_PRO_SENDER_ID,
      content_type: "text/html",
    },
    tags: [MODERATION_TAG, template].join(","),
  };

  if (DO_NOT_SEND_MAIL) {
    console.log(`${template} mail not send to ${to}:`);
    console.log(data);
    return;
  }

  const response = await fetch(CREATE_TICKET_ENDPOINT, {
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${ZAMMAD_TOKEN}`,
    },
    body: JSON.stringify(data),
    method: "POST",
  });

  const ticket = await response.json();

  return ticket as { id: number };
}
