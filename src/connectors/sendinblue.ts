import axios, { AxiosError, AxiosResponse } from 'axios';
import { isEmpty } from 'lodash';
import path from 'path';

import { render } from '../services/renderer';
import { SendInBlueApiError } from '../errors';

const { SENDINBLUE_API_KEY: apiKey = '' } = process.env;

const doNotSendMail = process.env.DO_NOT_SEND_MAIL === 'True';

type RemoteTemplateSlug =
  | 'join-organization'
  | 'verify-email'
  | 'reset-password'
  | 'magic-link';
type LocalTemplateSlug =
  | 'organization-welcome'
  | 'unable-to-auto-join-organization'
  | 'welcome'
  | 'moderation-processed';

// active templates id are listed at https://app-smtp.sendinblue.com/templates
const remoteTemplateSlugToSendinblueTemplateId: {
  [k in RemoteTemplateSlug]: number;
} = {
  'join-organization': 5,
  'verify-email': 6,
  'reset-password': 7,
  'magic-link': 29,
};
const defaultTemplateId = 21;
const hasRemoteTemplate = (
  template: RemoteTemplateSlug | LocalTemplateSlug
): template is RemoteTemplateSlug =>
  remoteTemplateSlugToSendinblueTemplateId.hasOwnProperty(template);

export const sendMail = async ({
  to = [],
  cc = [],
  subject,
  template,
  params,
}: {
  to: string[];
  cc?: string[];
  subject: string;
  template: RemoteTemplateSlug | LocalTemplateSlug;
  params: any;
}) => {
  const data = {
    sender: {
      name: 'L’équipe MonComptePro',
      email: 'moncomptepro@beta.gouv.fr',
    },
    replyTo: {
      name: 'L’équipe MonComptePro',
      email: 'moncomptepro@beta.gouv.fr',
    },
    to: to.map(e => ({ email: e })),
    subject,
    params,
    tags: [template],
    headers: {
      charset: 'iso-8859-1',
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
        params
      ),
    };
  }

  if (!isEmpty(cc)) {
    // @ts-ignore
    data.cc = cc.map(e => ({ email: e }));
  }

  if (doNotSendMail) {
    console.log(`${template} mail not send to ${to}:`);
    console.log(data);
    return;
  }

  try {
    const response: AxiosResponse<{ messageId: string }> = await axios({
      method: 'post',
      url: `https://api.sendinblue.com/v3/smtp/email`,
      headers: {
        'api-key': apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      data,
    });

    console.log(
      `${template} email sent to ${to} with message id ${response.data.messageId}`
    );
  } catch (error) {
    console.error(error);
    if (error instanceof AxiosError) {
      throw new SendInBlueApiError(error);
    }

    throw new Error('Error from SendInBlue API');
  }

  return true;
};
