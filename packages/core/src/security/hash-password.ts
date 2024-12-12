//

import bcrypt from "bcryptjs";

//

// TODO compare to https://github.com/anandundavia/manage-users/blob/master/src/api/utils/security.js
export function hashPassword(plainPassword: string): Promise<string> {
  return new Promise((resolve, reject) => {
    bcrypt.hash(plainPassword, 10, function (err: Error | null, hash: string) {
      if (err) {
        return reject(err);
      }

      return resolve(hash);
    });
  });
}
