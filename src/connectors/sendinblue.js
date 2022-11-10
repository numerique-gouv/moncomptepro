import axios from 'axios';
import { isEmpty } from 'lodash';
import path from 'path';

import { render } from '../services/renderer';

const apiKey =
  process.env.SENDINBLUE_API_KEY && !isEmpty(process.env.SENDINBLUE_API_KEY)
    ? process.env.SENDINBLUE_API_KEY
    : null;

const doNotSendMail = process.env.DO_NOT_SEND_MAIL === 'True';

// active templates are listed at https://app-smtp.sendinblue.com/templates
const templateToId = {
  'join-organization': 5,
  'verify-email': 6,
  'reset-password': 7,
  'magic-link': 29,
  default: 21,
};

export const sendMail = async ({
  to = [],
  cc = [],
  subject,
  template,
  params,
}) => {
  const data = {
    sender: {
      name: 'L’équipe MonComptePro',
      email: 'contact@api.gouv.fr',
    },
    replyTo: {
      name: 'L’équipe MonComptePro',
      email: 'contact@api.gouv.fr',
    },
    to: to.map(e => ({ email: e })),
    subject,
    params,
    tags: [template],
    headers: {
      charset: 'iso-8859-1',
    },
  };

  if (templateToId[template]) {
    data.templateId = templateToId[template];
  } else {
    data.templateId = templateToId['default'];
    data.params = {
      text_content: await render(
        path.resolve(`${__dirname}/../views/mails/${template}.ejs`),
        params
      ),
    };
  }

  if (!isEmpty(cc)) {
    data.cc = cc.map(e => ({ email: e }));
  }

  if (doNotSendMail) {
    console.log(`${template} mail not send to ${to}:`);
    console.log(data);
    return;
  }

  try {
    const response = await axios({
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
      `${template} email sent to ${to} with message id ${
        response.data.messageId
      }`
    );
  } catch (error) {
    console.error(error);

    throw new Error('Error from SendInBlue API');
  }

  return true;
};
