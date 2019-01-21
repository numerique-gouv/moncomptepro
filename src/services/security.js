import bcrypt from 'bcryptjs';
import nanoid from 'nanoid/async';

// TODO compare to https://github.com/anandundavia/manage-users/blob/master/src/api/utils/security.js
export const hashPassword = async plainPassword => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(plainPassword, 10, function(err, hash) {
      if (err) {
        return reject(err);
      }

      return resolve(hash);
    });
  });
};

export const validatePassword = async (plainPassword, storedHash) => {
  return await bcrypt.compare(plainPassword || '', storedHash);
};

// TODO use https://www.npmjs.com/package/owasp-password-strength-test instead
export const isPasswordSecure = plainPassword => {
  return plainPassword && plainPassword.length >= 10;
};

export const generateToken = async () => {
  return await nanoid();
};
