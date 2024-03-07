import "dotenv/config";
import * as cheerio from "cheerio";
import axios from "axios";
import fs from "fs";
import * as prettier from "prettier";

const PAGES = [
  "moncomptepro-accessibilite",
  "moncomptepro-politique-de-confidentialite",
  "moncomptepro-conditions-generales-d-utilisation",
];

const contentComment = `<!-- This file is generated automatically. Do not edit it directly, as your changes *will* get overwritten. -->
`;

let manifest: Record<string, { url: string; title: string; file: string }> = {};

Promise.all(
  PAGES.map((page) => {
    return new Promise((resolve) => {
      const url = `${process.env.LEGAL_URL}/${page}`;
      const slug = page.replace("moncomptepro-", "");

      axios
        .get(url)
        .then((response) => {
          const { content, title } = getContent(response.data);
          if (!content) {
            return;
          }

          return saveFile(
            `${__dirname}/../src/legal-pages/${slug}.html`,
            content,
          ).then(() => ({
            content,
            title,
          }));
        })
        .then((content) => {
          if (!content) {
            return;
          }
          console.log(`Saved src/legal-pages/${slug}.html`);
          if (!content.title) {
            console.log(
              "  Warning: no title found, make sure the page starts with a Heading 1",
            );
          }
          manifest[slug] = {
            url,
            title: content.title,
            file: `${slug}.html`,
          };
          resolve(true);
        });
    });
  }),
)
  .then(() => {
    return fs.promises.writeFile(
      `${__dirname}/../src/legal-pages/manifest.json`,
      JSON.stringify(manifest, null, 2),
    );
  })
  .then(() => {
    console.log(`Saved src/legal-pages/manifest.json`);
  });

const getContent = (html: string) => {
  const $ = cheerio.load(html);
  $("[style]").removeAttr("style");
  $("[class]").removeAttr("class");
  $("[id]").removeAttr("id");
  $("p").has("span:empty:first-child:last-child").remove();
  return {
    title: $("h1").first().text(),
    content: $("body").html(),
  };
};

const saveFile = (path: string, content: string) => {
  return prettier.format(content, { parser: "html" }).then((prettyContent) => {
    return fs.promises.writeFile(path, `${contentComment}${prettyContent}`);
  });
};
