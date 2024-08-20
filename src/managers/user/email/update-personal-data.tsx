//

import { Layout, Link, Text } from "../../../connectors/brevo.tempate-email";

//

export function update_personal_data_mail({
  family_name,
  given_name,
  updatedFields,
}: {
  family_name: string | null;
  given_name: string | null;
  updatedFields: {
    family_name: {
      new: string | null;
      old: string | null;
    };
    given_name: {
      new: string | null;
      old: string | null;
    };
    phone_number: {
      new: string | null;
      old: string | null;
    };
    job: {
      new: string | null;
      old: string | null;
    };
  };
}) {
  return (
    <Layout>
      <Text safe>
        Bonjour {given_name} {family_name},<br />
        <br />
        Nous vous informons que vos données personnelles ont été mises à jour
        avec succès.
        <br />
        <br />
        Les données modifiées sont les suivantes :
      </Text>
      <ul>
        {updatedFields.given_name && (
          <li>
            <Text safe>Prénom : {updatedFields.given_name.new}</Text>
          </li>
        )}
        {updatedFields.family_name && (
          <li>
            <Text safe>Nom de famille : {updatedFields.family_name.new}</Text>
          </li>
        )}
        {updatedFields.phone_number && (
          <li>
            <Text safe>
              Numéro de téléphone : {updatedFields.phone_number.new}
            </Text>
          </li>
        )}
        {updatedFields.job && (
          <li>
            <Text safe>Prénom : {updatedFields.job.new}</Text>
          </li>
        )}
      </ul>
      <Text>
        <Link href="mailto:contact@moncomptepro.beta.gouv.fr?subject=Erreur%20-%20Mon%20organisation">
          Si vous n'êtes pas à l'origine de ce changement, quelqu'un utilise
          peut-être votre compte. Faites-le nous savoir en répondant à cet
          email.
        </Link>
        <br />
        <br />
        Cordialement,
        <br />
        <br />
        L’équipe MonComptePro
      </Text>
    </Layout>
  );
}
