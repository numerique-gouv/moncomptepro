import axios, { AxiosResponse } from 'axios';

const apiKey = process.env.DEBOUNCE_API_KEY;
const doNotValidateMail = process.env.DO_NOT_VALIDATE_MAIL === 'True';

// documentation: https://developers.debounce.io/reference/single-validation#response-parameters
type DebounceResponse = {
  debounce: {
    // The email address you are requesting to validate.
    // ex: 'test@wanadoo.rf'
    email: string;
    // DeBounce validation response code.
    // ex: '6'
    code: string;
    // Is the email role-based or not. Role emails such as "sales@", "webmaster@" etc. are not suitable for sending marketing emails to.
    // ['true', 'false']
    role: string;
    // Is the email from a free email provider - like Gmail - or not.
    // ['true', 'false']
    free_email: string;
    // The final result of the validation process. This response will help to determine whether you should send marketing emails to a recipient or not.
    // ['Invalid', 'Risky', 'Safe to Send', 'Unknown']
    result: string;
    // The reason why the result is given.
    // ex: 'Bounce, Role'
    reason: string;
    // Is it suggested that you send transactional emails to the recipient or not (0: no, 1: yes). Generally, it is suggested to send transactional emails to Valid, Accept-all, and Unknown emails.
    // ['0', '1']
    send_transactional: string;
    // If you use a misspelled email address like someemail@gmial.com, the validation engine tries to suggest you the corrected email address.
    // ex: 'test@wanadoo.fr', ''
    did_you_mean: string;
  };
};

type EmailDebounceInfo = {
  isEmailSafeToSend: boolean;
  didYouMean?: string;
};

export const isEmailSafeToSendTransactional = async (
  email: string
): Promise<EmailDebounceInfo> => {
  if (doNotValidateMail) {
    console.log(`Email address "${email}" not verified.`);

    return { isEmailSafeToSend: true };
  }

  try {
    const {
      data: {
        debounce: { send_transactional, did_you_mean: didYouMean },
      },
    }: AxiosResponse<DebounceResponse> = await axios({
      method: 'get',
      url: `https://api.debounce.io/v1/?email=${email}&api=${apiKey}`,
      headers: {
        accept: 'application/json',
      },
    });

    console.log(
      `Email address "${email}" is ${
        send_transactional === '1' ? '' : 'NOT '
      }safe to send.${didYouMean ? ` Suggested email ${didYouMean}` : ''}`
    );

    return { isEmailSafeToSend: send_transactional === '1', didYouMean };
  } catch (error) {
    console.error(error);

    throw new Error('Error from Debounce API');
  }
};
