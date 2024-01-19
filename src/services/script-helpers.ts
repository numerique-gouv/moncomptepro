// from https://ipirozhenko.com/blog/measuring-requests-duration-nodejs-express/
import { isEmpty } from "lodash";

export const getDurationInMilliseconds = (start: [number, number]) => {
  const NS_PER_SEC = 1e9;
  const NS_TO_MS = 1e6;
  const diff = process.hrtime(start);

  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};

// from https://stackoverflow.com/questions/19700283/how-to-convert-time-in-milliseconds-to-hours-min-sec-format-in-javascript
export const humanReadableDuration = (msDuration: number) => {
  const h = Math.floor(msDuration / 1000 / 60 / 60);
  const m = Math.floor((msDuration / 1000 / 60 / 60 - h) * 60);
  const s = Math.floor(((msDuration / 1000 / 60 / 60 - h) * 60 - m) * 60);

  // To get time format 00:00:00
  const seconds = s < 10 ? `0${s}` : `${s}`;
  const minutes = m < 10 ? `0${m}` : `${m}`;
  const hours = h < 10 ? `0${h}` : `${h}`;

  return `${hours}h ${minutes}m ${seconds}s`;
};

export function isOrganizationInfo(
  organizationInfo: OrganizationInfo | {},
): organizationInfo is OrganizationInfo {
  return !isEmpty(organizationInfo);
}
