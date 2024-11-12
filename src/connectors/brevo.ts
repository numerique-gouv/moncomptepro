import axios, { AxiosError, type AxiosResponse } from "axios";
import { chain, isEmpty } from "lodash-es";
import path from "path";
import { BREVO_API_KEY, FEATURE_SEND_MAIL } from "../config/env";
import { BrevoApiError } from "../config/errors";
import { logger } from "../services/log";
import { render } from "../services/renderer";

type RemoteTemplateSlug = "magic-link" | "verify-email";
type LocalTemplateSlug = "welcome" | "moderation-processed";

// active templates id are listed at https://app-smtp.brevo.com/templates
const remoteTemplateSlugToBrevoTemplateId: {
  [k in RemoteTemplateSlug]: number;
} = {
  "magic-link": 1,
  "verify-email": 6,
};
const defaultBrevoTemplateId = 7;

const hasRemoteTemplate = (
  template: RemoteTemplateSlug | LocalTemplateSlug,
): template is RemoteTemplateSlug =>
  remoteTemplateSlugToBrevoTemplateId.hasOwnProperty(template);

export const sendMail = async ({
  to = [],
  cc = [],
  subject,
  template,
  params,
  senderEmail,
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
      name: "L’équipe ProConnect",
      email: senderEmail || "nepasrepondre@email.moncomptepro.beta.gouv.fr",
    },
    replyTo: {
      name: "L’équipe ProConnect",
      email: senderEmail || "support@moncomptepro.beta.gouv.fr",
    },
    // Brevo allow a maximum of 99 recipients
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
    data.templateId = remoteTemplateSlugToBrevoTemplateId[template];
  } else {
    data.templateId = defaultBrevoTemplateId;
    data.params = {
      text_content: await render(
        path.resolve(`${import.meta.dirname}/../views/mails/${template}.ejs`),
        params,
      ),
    };
  }

  if (!isEmpty(cc)) {
    data.cc = cc.map((e) => ({ email: e }));
  }

  if (!FEATURE_SEND_MAIL) {
    logger.info(`${template} mail not send to ${to}:`);
    logger.info(data);
    return;
  }

  try {
    const response: AxiosResponse<{ messageId: string }> = await axios({
      method: "post",
      url: `https://api.brevo.com/v3/smtp/email`,
      headers: {
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
        accept: "application/json",
      },
      data,
    });

    logger.info(
      `${template} email sent to ${to} with message id ${response.data.messageId}`,
    );
  } catch (error) {
    logger.error(error);
    if (error instanceof AxiosError) {
      throw new BrevoApiError(error);
    }

    throw new Error("Error from Brevo API");
  }

  return true;
};
