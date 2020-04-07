import ejs from 'ejs';
import path from 'path';

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

// this is a cheap layout implementation for ejs
// it looks for the _layout file and inject the targeted template in the body variable
export const ejsLayoutMiddlewareFactory = app => {
  return (req, res, next) => {
    const orig = res.render;
    res.render = (view, locals) => {
      app.render(view, locals, (err, html) => {
        if (err) throw err;
        orig.call(res, '_layout', {
          ...locals,
          body: html,
        });
      });
    };
    next();
  };
};

export const renderWithEjsLayout = async (templateName, params = {}) => {
  const bodyHtml = await render(
    path.resolve(`${__dirname}/../views/${templateName}.ejs`),
    params
  );

  return await render(path.resolve(`${__dirname}/../views/_layout.ejs`), {
    body: bodyHtml,
  });
};
