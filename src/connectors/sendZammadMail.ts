//

import { sampleSize } from "lodash";
import path from "node:path";
import { DO_NOT_SEND_MAIL, ZAMMAD_TOKEN, ZAMMAD_URL } from "../config/env";
import { render } from "../services/renderer";
import { LocalTemplateSlug } from "./sendinblue";

//

const CREATE_TICKET_ENDPOINT = `${ZAMMAD_URL}/api/v1/tickets`;
const FROM_MON_COMPTE_PRO = "MonComptePro";
const GROUP_MON_COMPTE_PRO = "MonComptePro";
const GROUP_MON_COMPTE_PRO_ID = "24";
const MODERATION_TAG = "moderation";
const PRIORITY_1_NORMAL = "1";
const SENDER_GROUP_MON_COMPTE_PRO = 2;
const STATE_CLOSED = "closed";
const TYPE_EMAIL = 1;

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
    state_id: STATE_CLOSED,
    priority_id: PRIORITY_1_NORMAL,
    article: {
      from: FROM_MON_COMPTE_PRO,
      to: sampleSize(to, 99).join(","),
      body,
      type_id: TYPE_EMAIL,
      sender_id: SENDER_GROUP_MON_COMPTE_PRO,
      content_type: "text/html",
    },
    tags: [MODERATION_TAG, template].join(","),
  };

  if (DO_NOT_SEND_MAIL) {
    console.log(`${template} mail not send to ${to}:`);
    console.log(data);
    return;
  }

  const ticket = await fetch(CREATE_TICKET_ENDPOINT, {
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${ZAMMAD_TOKEN}`,
    },
    body: JSON.stringify(data),
    method: "POST",
  });
}
(async () => {
  console.log("!!!!!!!");
  const ticket = await sendZammadMail({
    params: { libelle: "test" },
    subject: "Ping " + new Date().toLocaleDateString(),
    template: "unable-to-auto-join-organization",
    to: ["user@yopmail.com"],
  });
  console.log({ ticket });
  console.log("!!!!!!!");
})();
