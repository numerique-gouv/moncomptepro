//

import { Layout, Text } from "../../../connectors/brevo.tempate-email";

//

export function delete_2fa_protection_mail({
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
        Votre compte MonComptePro n'est plus protégé par la validation en deux
        étapes.
        <br />
        <br />
        Vous n'avez pas besoin de votre deuxième facteur pour vous connecter.
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
