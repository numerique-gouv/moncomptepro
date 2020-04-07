import path from 'path';
import mailjet from 'node-mailjet';
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
const host = process.env.API_AUTH_HOST;

const mailjetConnection = mailjet.connect(apiKey, secretKey);

export const sendMail = async ({ to = [], cc = [], subject, template, params }) => {
  const body = await render(
    path.resolve(`${__dirname}/../views/mails/${template}.ejs`),
    { ...params, host }
  );

  if (doNotSendMail) {
    console.log(`${template} mail not send to ${to}:`);
    console.log(body);
    return;
  }

  const sendEmail = mailjetConnection.post('send');

  const emailData = {
    FromEmail: 'contact@api.gouv.fr',
    FromName: 'API Gouv',
    Subject: subject,
    'Text-part': body,
    To: to.map(e => `<${e}>`).join(','),
    Cc: cc.map(e => `<${e}>`).join(','),
  };

  await sendEmail.request(emailData);

  console.log(`${template} email sent to ${to}`);

  return true;
};
