// src https://stackoverflow.com/questions/40994095/pipe-streams-to-edit-csv-file-in-node-js
import { isEmpty, toInteger } from "lodash";
import fs from "fs";
import {
  addAuthorizedDomain,
  upsert,
} from "../src/repositories/organization/setters";
import {
  getInseeAccessToken,
  getOrganizationInfo,
} from "../src/connectors/api-sirene";
// these lines can be uncommented to fix some type import in webstorm
// import "../src/types/organization-info";
// import "../src/types/user-organization-link";
// import "../src/types/user";
// import "../src/types/organization";
import { logger } from "../src/services/log";
import {
  getNumberOfLineInFile,
  humanReadableDuration,
  isOrganizationInfo,
  startDurationMesure,
  throttleApiCall,
} from "../src/services/script-helpers";
import { AxiosError } from "axios";
import { isAFreeEmailProvider } from "../src/services/uses-a-free-email-provider";

const { parse, transform, stringify } = require("csv");

const INPUT_FILE = process.env.INPUT_FILE ?? "./input.csv";
const OUTPUT_FILE = process.env.OUTPUT_FILE ?? "./output.csv";

// ex: for public insee subscription the script can be run like so:
// npm run update-organization-info 2000
const rateInMsFromArgs = toInteger(process.argv[2]);
// we wait 125ms max which allow us to make 8 requests to insee api per seconds
// this makes 480 request per minute which is just under our 500 requests per minute quota
// for 30 000 organizations, this script will run for about 1 hour
const maxInseeCallRateInMs = rateInMsFromArgs !== 0 ? rateInMsFromArgs : 125;

(async () => {
  const access_token = await getInseeAccessToken();

  const readStream = fs.createReadStream(INPUT_FILE); // readStream is a read-only stream wit raw text content of the CSV file
  const writeStream = fs.createWriteStream(OUTPUT_FILE); // writeStream is a write-only stream to write on the disk

  const inputCsvStream = parse({ columns: true, trim: true, cast: false }); // csv Stream is a read and write stream : it reads raw text in CSV and output untransformed records
  const outputCsvStream = stringify({
    quoted_empty: false,
    quoted_string: false,
    header: true,
  });

  type CsvData = { siren: string; declarant: string; last_declared_at: string };
  const input_file_lines = await getNumberOfLineInFile(INPUT_FILE);
  let i = 1;

  // 50ms is an estimated additional delay from insee API
  const estimatedExecutionTimeInMilliseconds =
    Math.max(maxInseeCallRateInMs, 320) * input_file_lines;

  logger.info("");
  logger.info(
    "\x1b[33m",
    `Estimated execution time is ${humanReadableDuration(
      estimatedExecutionTimeInMilliseconds,
    )}`,
    "\x1b[0m",
  );
  logger.info("");

  const transformStream = transform(
    async function (
      data: CsvData,
      done: (err: null | Error, data: null | CsvData) => void,
    ) {
      const start = startDurationMesure();
      try {
        const siren = data.siren;
        const domain = data.declarant.split("@").pop()!;
        logger.info(`${i}: processing ${siren} <> ${domain}...`);

        // 1. get organizationInfo
        const organizationInfo = await getOrganizationInfo(siren, access_token);
        if (!isOrganizationInfo(organizationInfo)) {
          throw new Error("empty organizationInfo");
        }

        // 2. update organizationInfo
        const organization: Organization = await upsert({
          siret: organizationInfo.siret,
          organizationInfo,
        });

        // 3. check for free email providers
        if (isAFreeEmailProvider(domain)) {
          throw new Error("free email provider");
        }

        // 4. check if domain exists
        if (!organization.authorized_email_domains.includes(domain)) {
          await addAuthorizedDomain({ siret: organization.siret, domain });
        } else {
          logger.info("\x1b[31m", `domain already in database`, "\x1b[0m");
        }

        await throttleApiCall(start, maxInseeCallRateInMs);
        i++;
        return done(null, null);
      } catch (error) {
        logger.info(
          "\x1b[31m",
          error instanceof AxiosError && !isEmpty(error.response)
            ? error.response.data
            : error,
          "\x1b[0m",
        );
        logger.info("");

        await throttleApiCall(start, maxInseeCallRateInMs);
        i++;
        // we put this in an output for future attempts
        return done(null, data);
      }
    },
    { parallel: 1 }, // avoid messing with line orders
  ).on("end", () =>
    logger.info(`Import done! failed inputs are recorded in ${OUTPUT_FILE}.`),
  );

  logger.info(`Importing data from ${INPUT_FILE}`);

  readStream
    .pipe(inputCsvStream)
    .pipe(transformStream)
    .pipe(outputCsvStream)
    .pipe(writeStream);
})();
