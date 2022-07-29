import { isEmpty } from 'lodash';
import { getOrganizationInfo } from '../src/connectors/api-sirene';
import { getDatabaseConnection } from '../src/connectors/postgres';

const getDurationInMilliseconds = start => {
  const NS_PER_SEC = 1e9;
  const NS_TO_MS = 1e6;
  const diff = process.hrtime(start);

  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};

(async () => {
  console.log('Start updating organization info...');
  let connection;
  let i = 0;

  try {
    connection = getDatabaseConnection();

    while (true) {
      const start = process.hrtime();

      // 1. get a organization
      const { rows: results } = await connection.query(
        `
SELECT id, siret FROM organizations LIMIT 1 OFFSET $1`,
        [i]
      );
      if (isEmpty(results)) {
        break;
      }
      const [{ id, siret }] = results;

      // 2. fetch organization info
      console.log(`${i}: fetching info for ${siret} (id: ${id})...`);
      let organizationInfo;
      try {
        organizationInfo = await getOrganizationInfo(siret);

        if (isEmpty(organizationInfo)) {
          throw new Error('not found');
        }
        if (organizationInfo.siret !== siret) {
          throw new Error('invalid response from sirene API');
        }
      } catch (error) {
        console.error(`Error while fetching data for: ${siret}`);
        console.error(error);
      }

      // 3. update the organization
      if (!isEmpty(organizationInfo)) {
        // TODO update organization here
        console.log(organizationInfo.libelle);
      }

      // 4. throttle the update
      const durationInMilliseconds = getDurationInMilliseconds(start);
      // we wait 250ms max which allow us to make 4 requests to insee api per seconds
      // this makes 240 request per minute which is the half of our 500 requests per minute quota
      // for 30 000 organizations, this script will run for about 2 hours
      const waitTimeInMilliseconds = Math.max(250 - durationInMilliseconds, 0);
      await new Promise(resolve => setTimeout(resolve, waitTimeInMilliseconds));

      // 5. increment index
      i++;
    }

    await connection.end();
    console.log('Update completed!');
  } catch (e) {
    await connection.end();
    console.error(
      `Unexpected error! The update was interrupted at index ${i}.`
    );
    console.error(e);
    process.exit(1);
  }
})();
