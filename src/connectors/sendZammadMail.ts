//

import { chain } from "lodash";
import { DO_NOT_SEND_MAIL, ZAMMAD_URL } from "../config/env";
import { LocalTemplateSlug, RemoteTemplateSlug } from "./sendinblue";

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
  template: RemoteTemplateSlug | LocalTemplateSlug;
  params: any;
  senderEmail?: string;
}) {
  const CREATE_TICKET_ENDPOINT = `${ZAMMAD_URL}/api/v1/tickets`;
  console.log("Sending mail to Zammad ", CREATE_TICKET_ENDPOINT);

  const data = {
    cc: undefined as { email: string }[] | undefined,
    sender: {
      name: "L’équipe MonComptePro",
      email: senderEmail,
    },
    replyTo: {
      name: "L’équipe MonComptePro",
      email: senderEmail,
    },
    // Sendinblue allow a maximum of 99 recipients
    to: chain(to)
      .sampleSize(99)
      .map((e) => ({ email: e }))
      .value(),
    subject,
    params,
    tags: [template],
    headers: {
      charset: "iso-8859-1",
    },
    templateId: 0,
  };

  if (DO_NOT_SEND_MAIL) {
    console.log(`${template} mail not send to ${to}:`);
    console.log(data);
    return;
  }

  return Promise.reject("Not implemented");
}
