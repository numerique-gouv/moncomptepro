// inspired from https://weblog.west-wind.com/posts/2014/Jan/06/JavaScript-JSON-Date-Parsing-and-real-Dates
const dateRegexp =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}\.\d*)(?:Z|([+\-])([\d|:]*))?$/;

const dateReviver = (key: string, value: any) =>
  dateRegexp.exec(value) ? new Date(value) : value;

export const jsonParseWithDate = (s: string) => JSON.parse(s, dateReviver);
