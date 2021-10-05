import path from 'path';
import axios from 'axios';
import { isEmpty } from 'lodash';

import { render } from '../services/renderer';

const apiKey =
  process.env.MAILJET_API_KEY && !isEmpty(process.env.MAILJET_API_KEY)
    ? process.env.MAILJET_API_KEY
    : null;
const secretKey =
  process.env.MAILJET_SECRET_KEY && !isEmpty(process.env.MAILJET_SECRET_KEY)
    ? process.env.MAILJET_SECRET_KEY
    : null;

const doNotSendMail = process.env.DO_NOT_SEND_MAIL === 'True';

// active templates are listed at https://app.mailjet.com/templates/transactional
const templateToId = {
  'join-organization': 3217699,
  'verify-email': 3217748,
  'reset-password': 3217827,
  default: 3217851,
};

export const sendMail = async ({
  to = [],
  cc = [],
  subject,
  template,
  params,
}) => {
  const data = {
    Messages: [
      {
        From: {
          Email: 'contact@api.gouv.fr',
          Name: 'L’équipe d’api.gouv.fr',
        },
        To: to.map(email => ({
          Email: email,
        })),
        Variables: params,
        Subject: subject,
        TemplateLanguage: true,
        Headers: {
          charset: 'iso-8859-1',
        },
      },
    ],
  };

  if (templateToId[template]) {
    data.Messages[0].TemplateID = templateToId[template];
  } else {
    data.Messages[0].TemplateID = templateToId['default'];
    data.Messages[0].Variables = {
      text_content: await render(
        path.resolve(`${__dirname}/../views/mails/${template}.ejs`),
        params
      ),
    };
  }

  if (!isEmpty(cc)) {
    data.Messages[0].Cc = cc.map(e => ({ Email: e }));
  }

  if (doNotSendMail) {
    console.log(`${template} mail not send to ${to}:`);
    console.log(data);
    return;
  }

  try {
    const response = await axios({
      method: 'post',
      url: 'https://api.mailjet.com/v3.1/send',
      auth: {
        username: apiKey,
        password: secretKey,
      },
      headers: {
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

    throw new Error('Error from Mailjet API');
  }

  return true;
};
