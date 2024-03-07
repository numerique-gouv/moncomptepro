import { NODE_ENV } from "../config/env";
import ejs from "ejs";
import path from "path";
import fs from "fs";
import { Application, NextFunction, Request, Response } from "express";
import {
  getUserFromLoggedInSession,
  isWithinLoggedInSession,
} from "../managers/session";

let manifest: Record<
  string,
  {
    file: string;
    imports?: string[];
    isEntry?: boolean;
    src?: string;
  }
> | null = null;

/**
 * take a css/js asset name and returns the hashed version of it
 *
 * this is used as a helper function in EJS templates, usable via `<%= asset('app.js') %>`
 *
 * @param name basename, ie 'app.js'
 * @returns hashed name with full public path of the file, ie '/dist/assets/app.js-5e486f4a.js`
 */
const viteAssetPath = (name: string) => {
  // cache the manifest file only in production
  if (NODE_ENV !== "production" || manifest === null) {
    try {
      const data = fs.readFileSync(
        path.resolve(__dirname, "..", "..", "dist", "manifest.json"),
        "utf8",
      );
      manifest = JSON.parse(data);
    } catch (e) {
      manifest = null;
    }
  }
  const filename = `assets/${name}`;
  if (manifest === null || !manifest[filename]) {
    return filename;
  }

  return `/dist/${manifest[filename].file}`;
};

export const render = (absolutePath: string, params: any) => {
  return new Promise((resolve, reject) => {
    ejs.renderFile(absolutePath, { ...params, asset: viteAssetPath }, {}, (err, str) => {
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
      app.render(view, { ...locals, asset: viteAssetPath }, (err: Error, html: string) => {
        if (err) throw err;
        orig.call(res, "_layout", {
          ...locals,
          // @ts-ignore
          asset: viteAssetPath,
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
    ...params,
    body: bodyHtml,
  });
};
