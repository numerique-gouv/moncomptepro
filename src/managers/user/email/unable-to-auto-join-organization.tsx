//

import { MONCOMPTEPRO_HOST } from "../../../config/env";
import { Layout, Text } from "../../../connectors/brevo.tempate-email";

//

export function unable_to_auto_join_organization_mail({
  libelle,
}: {
  libelle: string;
}) {
  return (
    <Layout>
      <Text>
        Bonjour,
        <br />
        <br />
        ⏱️ Notre équipe est en train de vous rattacher à l’organisation{" "}
        <b>{libelle}</b>.
        <br />
        <br />
        Vous recevrez un email pour accéder à votre démarche dès que nous aurons
        terminé.
        <br />
        <br />
        <i>(délai moyen : 1 jour ouvré)</i>
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

export function unable_to_auto_join_organization_md({
  libelle,
}: {
  libelle: string;
}) {
  return `
![Mon Compte Pro](https://img.mailinblue.com/2842821/images/rnb/original/63b58e65a1bf3a5d3868c6ce.png)

Bonjour,

⏱️ Notre équipe est en train de vous rattacher à l’organisation **${libelle}**.
Vous recevrez un email pour accéder à votre démarche dès que nous aurons terminé.
(délai moyen : 1 jour ouvré)

Cordialement,
L’équipe MonComptePro
`.trim();
}
