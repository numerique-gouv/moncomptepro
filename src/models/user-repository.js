import _ from 'lodash';
import { getDatabaseConnection } from '../connectors/postgres';

export const findById = async id => {
  const connection = getDatabaseConnection();

  const {
    rows: [result],
  } = await connection.query('SELECT * FROM users WHERE id = $1', [id]);

  return result;
};

export const findByEmail = async email => {
  const connection = getDatabaseConnection();

  const {
    rows: [result],
  } = await connection.query('SELECT * FROM users WHERE email = $1', [email]);

  return result;
};

export const findByVerifyEmailToken = async verify_email_token => {
  const connection = getDatabaseConnection();

  const {
    rows: [result],
  } = await connection.query(
    'SELECT * FROM users WHERE verify_email_token = $1',
    [verify_email_token]
  );

  return result;
};

export const findByResetPasswordToken = async reset_password_token => {
  const connection = getDatabaseConnection();

  const {
    rows: [result],
  } = await connection.query(
    'SELECT * FROM users WHERE reset_password_token = $1',
    [reset_password_token]
  );

  return result;
};

export const update = async (id, fieldsToUpdate) => {
  const connection = getDatabaseConnection();

  const paramsString = _(fieldsToUpdate)
    // { email: 'email@xy.z', encrypted_password: 'hash' }
    .toPairs()
    // [[ 'email', 'email@xy.z'], ['encrypted_password', 'hash' ]]
    .map((value, index) => `${value[0]} = $${index + 2}`)
    .value()
    // [ 'email = $2', 'encrypted_password = $3' ]
    .join(', ');
  // 'email = $2, encrypted_password = $3'

  const values = Object.values(fieldsToUpdate);
  // [ 'email@xy.z', 'hash' ]

  const {
    rows: [result],
  } = await connection.query(
    `UPDATE users SET ${paramsString} WHERE id = $1 RETURNING *`,
    [id, ...values]
  );

  return result;
};

export const insert = async user => {
  const connection = getDatabaseConnection();

  const paramsString = Object.keys(user).join(', ');
  // 'email, encrypted_password'

  const valuesString = _(user)
    // { email: 'email@xy.z', encrypted_password: 'hash' }
    .toPairs()
    // [[ 'email', 'email@xy.z'], ['encrypted_password', 'hash' ]]
    .map((value, index) => `$${index + 1}`)
    // [ '$1', '$2' ]
    .join(', ');
  // '$1, $2'

  const values = Object.values(user);
  // [ 'email@xy.z', 'hash' ]

  const {
    rows: [result],
  } = await connection.query(
    `INSERT INTO users (${paramsString}) VALUES (${valuesString}) RETURNING *;`,
    values
  );

  return result;
};
