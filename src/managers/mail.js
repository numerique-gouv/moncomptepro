const crypto = require('crypto');
const { sendMail: sendMailWithMailjet } = require('../connectors/mailjet');
const {
  sendMail: sendMailWithSendinBlue,
} = require('../connectors/sendinblue');

export const sendMail = payload => {
  const abTestedMailer = abTestOnEmail(
    sendMailWithSendinBlue,
    sendMailWithMailjet,
    10,
    payload.email
  );
  return abTestedMailer(payload);
};

export const abTestOnEmail = (optionA, optionB, periodicity, email) => {
  const emailHexHash = crypto
    .createHash('md5')
    .update(email)
    .digest('hex');
  const emailBase10Hash = parseInt(emailHexHash.slice(0, 2), 16);

  if (emailBase10Hash % periodicity === 0) {
    return optionB;
  }
  return optionA;
};
