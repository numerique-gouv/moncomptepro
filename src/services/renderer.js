import ejs from 'ejs';
import { isEmpty } from 'lodash';
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

const getUserLabel = req => {
  if (isEmpty(req.session.user)) {
    //  do not display label when no session is found
    return null;
  }
  if (!req.session.user.given_name || !req.session.user.family_name) {
    //  display email when a name is missing
    return req.session.user.email;
  }
  return `${req.session.user.given_name} ${req.session.user.family_name}`;
};

// this is a cheap layout implementation for ejs
// it looks for the _layout file and inject the targeted template in the body variable
export const ejsLayoutMiddlewareFactory = (
  app,
  use_dashboard_header = false
) => {
  return (req, res, next) => {
    const orig = res.render;
    res.render = (view, locals) => {
      app.render(view, locals, (err, html) => {
        if (err) throw err;
        orig.call(res, '_layout', {
          ...locals,
          body: html,
          header_user_label: getUserLabel(req),
          use_dashboard_header,
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
