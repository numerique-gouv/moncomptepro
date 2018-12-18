import ejs from 'ejs';

export const render = (absolutePath, params) => {
  return new Promise((resolve, reject) => {
    ejs.renderFile(absolutePath, params, null, (err, str) => {
      if (err) {
        return reject(err);
      }

      return resolve(str);
    });
  });
};
