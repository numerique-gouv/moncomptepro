import log, { LogLevelNames } from "console-log-level";
import { LOG_LEVEL } from "../config/env";
import moment from "moment";

const getLogLevelName = (level: string): LogLevelNames => {
  const levels: LogLevelNames[] = [
    "trace",
    "debug",
    "info",
    "warn",
    "error",
    "fatal",
  ];
  if (levels.includes(level as LogLevelNames)) {
    return level as LogLevelNames;
  }

  return "info";
};

// Apache Common Log Format
function formatDateNowApacheCommon(): string {
  return moment().format("[[]DD/MMM/YYYY:HH:mm:ss ZZ[]]");
}

export const logger = log({
  prefix: formatDateNowApacheCommon,
  level: getLogLevelName(LOG_LEVEL),
});
