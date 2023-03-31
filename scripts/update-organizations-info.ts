import { isDate, isEmpty, toInteger } from 'lodash';
import { getOrganizationInfo } from '../src/connectors/api-sirene';
import { getDatabaseConnection } from '../src/connectors/postgres';
import { AxiosError } from 'axios';
import { upsert } from '../src/repositories/organization/setters';

// ex: for public insee subscription the script can be run like so:
// npm run update-organization-info 2000
const rateInMsFromArgs = toInteger(process.argv[2]);
const maxInseeCallRateInMs = rateInMsFromArgs !== 0 ? rateInMsFromArgs : 250;

// from https://ipirozhenko.com/blog/measuring-requests-duration-nodejs-express/
const getDurationInMilliseconds = (start: [number, number]) => {
  const NS_PER_SEC = 1e9;
  const NS_TO_MS = 1e6;
  const diff = process.hrtime(start);

  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};

// from https://stackoverflow.com/questions/19700283/how-to-convert-time-in-milliseconds-to-hours-min-sec-format-in-javascript
const humanReadableDuration = (msDuration: number) => {
  const h = Math.floor(msDuration / 1000 / 60 / 60);
  const m = Math.floor((msDuration / 1000 / 60 / 60 - h) * 60);
  const s = Math.floor(((msDuration / 1000 / 60 / 60 - h) * 60 - m) * 60);

  // To get time format 00:00:00
  const seconds = s < 10 ? `0${s}` : `${s}`;
  const minutes = m < 10 ? `0${m}` : `${m}`;
  const hours = h < 10 ? `0${h}` : `${h}`;

  return `${hours}h ${minutes}m ${seconds}s`;
};

function isOrganizationInfo(
  organizationInfo: OrganizationInfo | {}
): organizationInfo is OrganizationInfo {
  return !isEmpty(organizationInfo);
}

(async () => {
  console.log('Start updating organization info...');
  let connection;
  let i = 0;

  try {
    connection = getDatabaseConnection();

    // 0. estimate execution time
    const {
      rows: [{ count }],
    } = await connection.query(
      `
    SELECT COUNT(*) FROM organizations WHERE organization_info_fetched_at IS NULL`,
      []
    );

    // 50ms is an estimated additional delay from insee API
    const estimatedExecutionTimeInMilliseconds =
      Math.max(maxInseeCallRateInMs, 320) * toInteger(count);
    console.log('');
    console.log(
      '\x1b[33m',
      `Estimated execution time is ${humanReadableDuration(
        estimatedExecutionTimeInMilliseconds
      )}`,
      '\x1b[0m'
    );
    console.log('');

    while (true) {
      const start = process.hrtime();

      // 1. get a organization
      const { rows: results } = await connection.query(
        `
SELECT id, siret, organization_info_fetched_at
FROM organizations
ORDER BY id LIMIT 1 OFFSET $1`,
        [i]
      );
      if (isEmpty(results)) {
        break;
      }
      const [{ id, siret, organization_info_fetched_at }] = results;

      if (isDate(organization_info_fetched_at)) {
        i++;
        continue;
      }

      // 2. fetch organization info
      console.log(`${i}: fetching info for ${siret} (id: ${id})...`);
      let organizationInfo = {};
      try {
        organizationInfo = await getOrganizationInfo(siret);

        if (!isOrganizationInfo(organizationInfo)) {
          throw new Error('not found');
        }

        if (organizationInfo.siret !== siret) {
          throw new Error('invalid response from sirene API');
        }
      } catch (error) {
        console.log(
          '\x1b[31m',
          `Error while fetching data for: ${siret}`,
          '\x1b[0m'
        );
        console.error(`Error while fetching data for: ${siret}`);
        console.error(
          error instanceof AxiosError && !isEmpty(error.response)
            ? error.response.data
            : error
        );
        console.error('');
      }

      // 3. update the organization
      if (isOrganizationInfo(organizationInfo)) {
        console.log(`libelle: ${organizationInfo.libelle}`);
        await upsert({ siret, organizationInfo });
      }

      // 4. throttle the update
      const durationInMilliseconds = getDurationInMilliseconds(start);
      // we wait 250ms max which allow us to make 4 requests to insee api per seconds
      // this makes 240 request per minute which is the half of our 500 requests per minute quota
      // for 30 000 organizations, this script will run for about 2 hours
      const waitTimeInMilliseconds = Math.max(
        maxInseeCallRateInMs - durationInMilliseconds,
        0
      );
      await new Promise(resolve => setTimeout(resolve, waitTimeInMilliseconds));

      // 5. increment index
      i++;
    }

    await connection.end();
    console.log('');
    console.log('\x1b[32m', 'Update completed!', '\x1b[0m');
  } catch (e) {
    await connection.end();
    console.log('');
    console.log('\x1b[31m', 'Update aborted!', '\x1b[0m');
    console.error(
      `Unexpected error! The update was interrupted at index ${i}.`
    );
    console.error(e);
    process.exit(1);
  }
})();
