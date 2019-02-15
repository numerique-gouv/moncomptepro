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

// this is a cheap layout implementation for ejs
// it looks for the _layout file and inject the targeted template in the body variable
export const ejsLayoutMiddelwareFactory = app => {
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
