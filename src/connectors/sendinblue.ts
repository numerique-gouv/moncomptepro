import axios, { AxiosError, AxiosResponse } from "axios";
import { chain, isEmpty } from "lodash";
import path from "path";
import {
  DO_NOT_SEND_MAIL,
  SENDINBLUE_API_KEY,
  ZAMMAD_URL,
} from "../config/env";
import { SendInBlueApiError } from "../config/errors";
import { render } from "../services/renderer";

type RemoteTemplateSlug =
  | "join-organization"
  | "verify-email"
  | "reset-password"
  | "magic-link"
  | "choose-sponsor"
  | "official-contact-email-verification";
type LocalTemplateSlug =
  | "organization-welcome"
  | "unable-to-auto-join-organization"
  | "unable-to-find-sponsor"
  | "welcome"
  | "moderation-processed";

// active templates id are listed at https://app-smtp.sendinblue.com/templates
const remoteTemplateSlugToSendinblueTemplateId: {
  [k in RemoteTemplateSlug]: number;
} = {
  "join-organization": 61,
  "verify-email": 6,
  "reset-password": 7,
  "magic-link": 29,
  "choose-sponsor": 56,
  "official-contact-email-verification": 64,
};
const defaultTemplateId = 21;
const hasRemoteTemplate = (
  template: RemoteTemplateSlug | LocalTemplateSlug,
): template is RemoteTemplateSlug =>
  remoteTemplateSlugToSendinblueTemplateId.hasOwnProperty(template);

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

export const sendMail = async ({
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
}) => {
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

  if (hasRemoteTemplate(template)) {
    data.templateId = remoteTemplateSlugToSendinblueTemplateId[template];
  } else {
    data.templateId = defaultTemplateId;
    data.params = {
      text_content: await render(
        path.resolve(`${__dirname}/../views/mails/${template}.ejs`),
        params,
      ),
    };
  }

  if (!isEmpty(cc)) {
    data.cc = cc.map((e) => ({ email: e }));
  }

  if (DO_NOT_SEND_MAIL) {
    console.log(`${template} mail not send to ${to}:`);
    console.log(data);
    return;
  }

  try {
    const response: AxiosResponse<{ messageId: string }> = await axios({
      method: "post",
      url: `https://api.sendinblue.com/v3/smtp/email`,
      headers: {
        "api-key": SENDINBLUE_API_KEY,
        "content-type": "application/json",
        accept: "application/json",
      },
      data,
    });

    console.log(
      `${template} email sent to ${to} with message id ${response.data.messageId}`,
    );
  } catch (error) {
    console.error(error);
    if (error instanceof AxiosError) {
      throw new SendInBlueApiError(error);
    }

    throw new Error("Error from SendInBlue API");
  }

  return true;
};
