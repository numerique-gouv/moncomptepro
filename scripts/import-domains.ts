// src https://stackoverflow.com/questions/40994095/pipe-streams-to-edit-csv-file-in-node-js
import fs from "fs";
import { isEmpty, toInteger } from "lodash-es";
import {
  getInseeAccessToken,
  getOrganizationInfo,
} from "../src/connectors/api-sirene";
import {
  addTrackdechetsDomain,
  upsert,
} from "../src/repositories/organization/setters";
// these lines can be uncommented to fix some type import in webstorm
// import "../src/types/organization-info";
// import "../src/types/user-organization-link";
// import "../src/types/user";
// import "../src/types/organization";
import { AxiosError } from "axios";
import { logger } from "../src/services/log";
import {
  isServicePublic,
  isWasteManagementOrganization,
} from "../src/services/organization";
import {
  getNumberOfLineInFile,
  humanReadableDuration,
  isOrganizationInfo,
  startDurationMesure,
  throttleApiCall,
} from "../src/services/script-helpers";
import { isDomainValid, isSiretValid } from "../src/services/security";
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

  type InputCsvData = { domain: string; siret: string };
  type OutputCsvData = { domain: string; siret: string; result: string };
  const input_file_lines = await getNumberOfLineInFile(INPUT_FILE);
  let i = 1;
  let rejected_invalid_domain_count = 0;
  let rejected_invalid_siret_count = 0;
  let rejected_free_email_domain_count = 0;
  let rejected_empty_org_count = 0;
  let rejected_service_public_count = 0;
  let rejected_waste_management_organizations = 0;
  let unexpected_error_count = 0;
  let success_count = 0;

  // 50ms is an estimated additional delay from insee API
  const estimatedExecutionTimeInMilliseconds =
    (maxInseeCallRateInMs + 50) * input_file_lines;

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
      data: InputCsvData,
      done: (err: null | Error, data: OutputCsvData) => void,
    ) {
      const start = startDurationMesure();
      try {
        const siret = data.siret;
        const domain = data.domain;
        logger.info(`${i}: processing ${siret} <> ${domain}...`);
        // 0. checks params
        if (!isDomainValid(domain)) {
          i++;
          rejected_invalid_domain_count++;
          return done(null, { ...data, result: "rejected_invalid_domain" });
        }
        if (!isSiretValid(siret)) {
          i++;
          rejected_invalid_siret_count++;
          return done(null, { ...data, result: "rejected_invalid_siret" });
        }

        // 1. checks for free email providers
        if (isAFreeEmailProvider(domain)) {
          i++;
          rejected_free_email_domain_count++;
          return done(null, { ...data, result: "rejected_free_email_domain" });
        }

        // 2. get organizationInfo
        const organizationInfo = await getOrganizationInfo(siret, access_token);
        if (!isOrganizationInfo(organizationInfo)) {
          await throttleApiCall(start, maxInseeCallRateInMs);
          i++;
          rejected_empty_org_count++;
          return done(null, { ...data, result: "rejected_empty_org" });
        }

        // 3. update organizationInfo
        const organization: Organization = await upsert({
          siret: organizationInfo.siret,
          organizationInfo,
        });

        // 4. discard public services
        if (isServicePublic(organization)) {
          await throttleApiCall(start, maxInseeCallRateInMs);
          i++;
          rejected_service_public_count++;
          return done(null, { ...data, result: "rejected_service_public" });
        }

        // 5. discard waste management organizations
        if (isWasteManagementOrganization(organization)) {
          await throttleApiCall(start, maxInseeCallRateInMs);
          i++;
          rejected_waste_management_organizations++;
          return done(null, {
            ...data,
            result: "rejected_waste_management_organizations",
          });
        }

        await addTrackdechetsDomain({ siret, domain });
        await throttleApiCall(start, maxInseeCallRateInMs);
        i++;
        success_count++;
        return done(null, { ...data, result: "success" });
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
        unexpected_error_count++;
        return done(null, { ...data, result: "unexpected_error" });
      }
    },
    { parallel: 1 }, // avoid messing with line orders
  ).on("end", () => {
    logger.info(`Import done! Import logs are recorded in ${OUTPUT_FILE}.`);
    logger.info("");
    logger.info(
      "success_count:                          \x1b[32m",
      success_count,
      "\x1b[0m",
    );
    logger.info(
      "rejected_invalid_domain_count:          \x1b[33m",
      rejected_invalid_domain_count,
      "\x1b[0m",
    );
    logger.info(
      "rejected_invalid_siret_count:           \x1b[33m",
      rejected_invalid_siret_count,
      "\x1b[0m",
    );
    logger.info(
      "rejected_free_email_domain_count:       \x1b[33m",
      rejected_free_email_domain_count,
      "\x1b[0m",
    );
    logger.info(
      "rejected_empty_org_count:               \x1b[33m",
      rejected_empty_org_count,
      "\x1b[0m",
    );
    logger.info(
      "rejected_service_public_count:          \x1b[33m",
      rejected_service_public_count,
      "\x1b[0m",
    );
    logger.info(
      "rejected_waste_management_organizations:\x1b[33m",
      rejected_waste_management_organizations,
      "\x1b[0m",
    );
    logger.info(
      "unexpected_error_count:                 \x1b[31m",
      unexpected_error_count,
      "\x1b[0m",
    );
    logger.info(
      "total:                                  \x1b[1m",
      i - 1,
      "\x1b[21m",
    );
  });

  logger.info(`Importing data from ${INPUT_FILE}`);

  readStream
    .pipe(inputCsvStream)
    .pipe(transformStream)
    .pipe(outputCsvStream)
    .pipe(writeStream);
})();
