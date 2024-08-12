//

import { Layout, Link, Text } from "../../../connectors/brevo.tempate-email";

//

export function delete_free_totp_mail({
  family_name,
  given_name,
}: {
  family_name: string | null;
  given_name: string | null;
}) {
  return (
    <Layout>
      <Text safe>
        Bonjour ${given_name} ${family_name}, <br />
        <br />
      </Text>
      <Text>
        L'application a été supprimée comme étape de connexion à deux facteurs.
        <br />
        <br />
        <Link href="mailto:contact@moncomptepro.beta.gouv.fr?subject=Erreur%20-%20Mon%20organisation">
          Si vous n'avez pas supprimé cette application, quelqu'un utilise
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
