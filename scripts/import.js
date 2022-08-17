// src https://stackoverflow.com/questions/40994095/pipe-streams-to-edit-csv-file-in-node-js
import csv from 'csv';
import fs from 'fs';
import { isEmpty, some } from 'lodash';
import {
  addUser,
  create,
  findBySiret,
  getUsers,
} from '../src/repositories/organization';
import { findByEmail } from '../src/repositories/user';

const INPUT_FILE = './input.csv';
const OUTPUT_FILE = './output.csv';
const USER_EMAIL = 'test@yopmail.com';

(async () => {
  const user = await findByEmail(USER_EMAIL);

  if (isEmpty(user)) {
    throw new Error('user_not_found');
  }

  const readStream = fs.createReadStream(INPUT_FILE); // readStream is a read-only stream wit raw text content of the CSV file
  const writeStream = fs.createWriteStream(OUTPUT_FILE); // writeStream is a write-only stream to write on the disk

  const inputCsvStream = csv.parse({ columns: true, trim: true, cast: true }); // csv Stream is a read and write stream : it reads raw text in CSV and output untransformed records
  const outputCsvStream = csv.stringify({
    quoted_empty: false,
    quoted_string: true,
    header: true,
  });
  const transformStream = csv
    .transform(
      async function(data, done) {
        try {
          // copied from src/managers/organization.js#joinOrganization
          const emailDomain = data.resp_traitement_email.split('@').pop();
          let organization = await findBySiret(data.siret);

          // Create organization if needed
          if (isEmpty(organization)) {
            console.log(
              `Importing ${data.siret} with domain ${emailDomain}...`
            );
            organization = await create({
              siret: data.siret,
              authorized_email_domains: [emailDomain],
            });
          } else {
            console.log(
              `\x1B[33mWarning: ${data.siret} already exist. Domain ${emailDomain} were not added to it. You may want to add it manually. Current authorized domains: ${organization.authorized_email_domains}.\x1B[0m`
            );
          }

          // Ensure user is not in organization already
          const usersInOrganizationAlready = await getUsers(organization.id);
          if (some(usersInOrganizationAlready, ['email', USER_EMAIL])) {
            console.log(
              `\x1B[33mWarning: ${USER_EMAIL} in organization already.\x1B[0m`
            );
          } else {
            console.log(
              `Adding ${USER_EMAIL} to organization along with ${usersInOrganizationAlready.map(
                ({ email }) => email
              )}...`
            );
            // Link user to organization
            await addUser({
              organization_id: organization.id,
              user_id: user.id,
            });
          }

          data.organization_id = organization.id;
          done(null, data);
        } catch (e) {
          console.log(`\x1B[31mError: unable to import ${data.siret}.\x1B[0m`);
          console.log(e);
        }
      },
      { parallel: 1 } // avoid messing with line orders
    )
    .on('end', () =>
      console.log(`Import done! Organization_id were added in ${OUTPUT_FILE}.`)
    );

  console.log(`Importing data from ${INPUT_FILE}`);

  readStream
    .pipe(inputCsvStream)
    .pipe(transformStream)
    .pipe(outputCsvStream)
    .pipe(writeStream);
})();
