// import { Client } from "pg"; // more here https://node-postgres.com/
import { find, findIndex, last } from 'lodash';

const users = [
  {
    id: 1,
    email: 'particulier@domain.user',
    legacy_user: true, // this field is new
    encrypted_password:
      '$2a$11$LERSTLNbSPG./JlOreoz3u7Tt8MtEAfgEb.FvO4LG4VJ6BgQCxuNi',
    reset_password_token: '',
    reset_password_sent_at: '',
    sign_in_count: 0,
    last_sign_in_at: '',
    created_at: new Date('2018-12-10 14:08:08.101081Z'),
    updated_at: new Date('2018-12-10 14:08:08.101081Z'),
    roles: ['domain', 'api-particulier-token-admin'],
  },
  {
    id: 4,
    email: 'service_provider@domain.user',
    legacy_user: true,
    encrypted_password:
      '$2a$11$TzOShc0yg7K0nahltAI9fOJmuoaPqmawZ0geuZ/JFsTXFdM3Xsq.m',
    reset_password_token: '',
    reset_password_sent_at: '',
    sign_in_count: 0,
    last_sign_in_at: '',
    created_at: new Date('2018-12-10 14:08:08.101081Z'),
    updated_at: new Date('2018-12-10 14:08:08.101081Z'),
    roles: ['domain'],
  },
  {
    id: 5,
    email: 'franceconnect@domain.user',
    legacy_user: true, // this field is new
    encrypted_password:
      '$2a$11$oFX9YmL11QNRdebu9HsQqeDHkCXEUgXicBmwY4N7ImcN1WVz67ku2',
    reset_password_token: '',
    reset_password_sent_at: '',
    sign_in_count: 0,
    last_sign_in_at: '',
    created_at: new Date('2018-12-10 14:08:08.101081Z'),
    updated_at: new Date('2018-12-10 14:08:08.101081Z'),
    roles: ['domain', 'franceconnect-token-admin'],
  },
];

export const findById = async id => {
  return find(users, { id });
};

export const findByEmail = async email => {
  return find(users, { email });
};

export const findByToken = async reset_password_token => {
  return find(users, { reset_password_token });
};

export const update = async (id, fieldsToUpdate) => {
  const indexToUpdate = findIndex(users, { id });

  users[indexToUpdate] = {
    ...users[indexToUpdate],
    ...fieldsToUpdate,
  };

  return users[indexToUpdate];
};

export const insert = async user => {
  users.push({
    ...user,
    id: Math.floor(Math.random() * Math.floor(100000)), // fake increment with high risk of collision
  });

  return await last(users);
};
