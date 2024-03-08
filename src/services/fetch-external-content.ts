import { EXTERNAL_CONTENT_URL } from "../config/env";
import axios from "axios";
import * as cheerio from "cheerio";

export const getExternalContent = async (externalSlug: string) => {
  const url = `${EXTERNAL_CONTENT_URL}/${externalSlug}`;
  const response = await axios.get(url);
  return parseContent(response.data);
};

const parseContent = (html: string) => {
  const $ = cheerio.load(html);
  $("[style]").removeAttr("style");
  $("[class]").removeAttr("class");
  $("[id]").removeAttr("id");
  $("p").has("span:empty:first-child:last-child").remove();
  return {
    title: $("h1").first().text() || "",
    body: $("body").html() || "",
  };
};
