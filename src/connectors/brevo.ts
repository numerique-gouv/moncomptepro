import axios, { AxiosError, AxiosResponse } from "axios";
import { chain, isEmpty } from "lodash";
import path from "path";
import {
  BREVO_API_KEY,
  DO_NOT_SEND_MAIL,
  SENDINBLUE_API_KEY,
} from "../config/env";
import { BrevoApiError } from "../config/errors";
import { render } from "../services/renderer";
import { logger } from "../services/log";

type RemoteDeprecatedTemplateSlug = "verify-email";
type RemoteTemplateSlug =
  | "official-contact-email-verification"
  | "choose-sponsor"
  | "reset-password"
  | "magic-link"
  | "join-organization";
type LocalTemplateSlug =
  | "organization-welcome"
  | "unable-to-auto-join-organization"
  | "welcome"
  | "moderation-processed";

// active templates id are listed at https://app-smtp.brevo.com/templates
const remoteTemplateSlugToBrevoDeprecatedTemplateId: {
  [k in RemoteDeprecatedTemplateSlug]: number;
} = {
  "verify-email": 6,
};
const remoteTemplateSlugToBrevoTemplateId: {
  [k in RemoteTemplateSlug]: number;
} = {
  "official-contact-email-verification": 3,
  "choose-sponsor": 2,
  "reset-password": 5,
  "magic-link": 1,
  "join-organization": 4,
  // TODO: progressively uncomment these lines
  // "verify-email": 6,
};
const localTemplateSlugs: LocalTemplateSlug[] = [
  "organization-welcome",
  "unable-to-auto-join-organization",
  "welcome",
  "moderation-processed",
];
const defaultBrevoTemplateId = 7;

const hasRemoteTemplate = (
  template:
    | RemoteTemplateSlug
    | RemoteDeprecatedTemplateSlug
    | LocalTemplateSlug,
): template is RemoteTemplateSlug =>
  remoteTemplateSlugToBrevoTemplateId.hasOwnProperty(template);

const isLocalTemplateSlug = (value: string): value is LocalTemplateSlug => {
  return localTemplateSlugs.includes(value as LocalTemplateSlug);
};

const usesNewBrevoAccount = (
  template:
    | RemoteTemplateSlug
    | RemoteDeprecatedTemplateSlug
    | LocalTemplateSlug,
): template is RemoteTemplateSlug | LocalTemplateSlug =>
  hasRemoteTemplate(template) || isLocalTemplateSlug(template);

const hasRemoteDeprecatedTemplate = (
  template:
    | RemoteTemplateSlug
    | RemoteDeprecatedTemplateSlug
    | LocalTemplateSlug,
): template is RemoteDeprecatedTemplateSlug =>
  remoteTemplateSlugToBrevoDeprecatedTemplateId.hasOwnProperty(template);

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
  template:
    | RemoteTemplateSlug
    | RemoteDeprecatedTemplateSlug
    | LocalTemplateSlug;
  params: any;
  senderEmail?: string;
}) => {
  const data = {
    cc: undefined as { email: string }[] | undefined,
    sender: {
      name: "",
      email: "",
    },
    replyTo: {
      name: "",
      email: "",
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

  if (usesNewBrevoAccount(template)) {
    data.sender = {
      name: "L’équipe MonComptePro",
      email: senderEmail || "ne-pas-repondre@email.moncomptepro.beta.gouv.fr",
    };
    data.replyTo = {
      name: "L’équipe MonComptePro",
      email: senderEmail || "support@moncomptepro.beta.gouv.fr",
    };
  } else {
    data.sender = {
      name: "L’équipe MonComptePro",
      email: senderEmail || "moncomptepro@beta.gouv.fr",
    };
    data.replyTo = {
      name: "L’équipe MonComptePro",
      email: senderEmail || "moncomptepro@beta.gouv.fr",
    };
  }

  if (hasRemoteTemplate(template)) {
    data.templateId = remoteTemplateSlugToBrevoTemplateId[template];
  } else if (hasRemoteDeprecatedTemplate(template)) {
    data.templateId = remoteTemplateSlugToBrevoDeprecatedTemplateId[template];
  } else {
    data.templateId = defaultBrevoTemplateId;
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
    logger.info(`${template} mail not send to ${to}:`);
    logger.info(data);
    return;
  }

  try {
    const response: AxiosResponse<{ messageId: string }> = await axios({
      method: "post",
      url: `https://api.brevo.com/v3/smtp/email`,
      headers: {
        "api-key": usesNewBrevoAccount(template)
          ? BREVO_API_KEY
          : SENDINBLUE_API_KEY,
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
