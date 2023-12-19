import ejs from "ejs";
import path from "path";
import { Application, NextFunction, Request, Response } from "express";
import {
  getUserFromLoggedInSession,
  isWithinLoggedInSession,
} from "../managers/session";

export const render = (absolutePath: string, params: any) => {
  return new Promise((resolve, reject) => {
    ejs.renderFile(absolutePath, params, {}, (err, str) => {
      if (err) {
        return reject(err);
      }

      return resolve(str);
    });
  });
};

const getUserLabel = (req: Request) => {
  if (!isWithinLoggedInSession(req)) {
    //  do not display label when no session is found
    return null;
  }
  const user = getUserFromLoggedInSession(req);
  if (!user.given_name || !user.family_name) {
    //  display email when a name is missing
    return user.email;
  }
  return `${user.given_name} ${user.family_name}`;
};

// this is a cheap layout implementation for ejs
// it looks for the _layout file and inject the targeted template in the body variable
export const ejsLayoutMiddlewareFactory = (
  app: Application,
  use_dashboard_header: boolean = false,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const orig = res.render;
    res.render = (view, locals = {}) => {
      app.render(view, locals, (err: Error, html: string) => {
        if (err) throw err;
        orig.call(res, "_layout", {
          ...locals,
          // @ts-ignore
          body: html,
          header_user_label: getUserLabel(req),
          use_dashboard_header,
        });
      });
    };
    next();
  };
};

export const renderWithEjsLayout = async (
  templateName: string,
  params = {},
) => {
  const bodyHtml = await render(
    path.resolve(`${__dirname}/../views/${templateName}.ejs`),
    params,
  );

  return await render(path.resolve(`${__dirname}/../views/_layout.ejs`), {
    body: bodyHtml,
  });
};
