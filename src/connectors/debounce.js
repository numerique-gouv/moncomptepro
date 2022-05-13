import { isEmpty } from 'lodash';
import axios from 'axios';

const apiKey =
  process.env.DEBOUNCE_API_KEY && !isEmpty(process.env.DEBOUNCE_API_KEY)
    ? process.env.DEBOUNCE_API_KEY
    : null;

const doNotValidateMail = process.env.DO_NOT_VALIDATE_MAIL === 'True';

export const isEmailSafeToSendTransactional = async email => {
  if (doNotValidateMail) {
    return true;
  }

  try {
    const {
      data: {
        debounce: { send_transactional },
      },
    } = await axios({
      method: 'get',
      url: `https://api.debounce.io/v1/?email=${email}&api=${apiKey}`,
      headers: {
        accept: 'application/json',
      },
    });

    return send_transactional === '1';
  } catch (error) {
    console.error(error);

    throw new Error('Error from Debounce API');
  }
};
