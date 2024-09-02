//

import { MONCOMPTEPRO_HOST } from "../../config/env";

//

export function unable_to_auto_join_organization_md({
  libelle,
}: {
  libelle: string;
}) {
  return `
![Mon Compte Pro](${MONCOMPTEPRO_HOST}/dist/mail-banner.png)

Bonjour,

⏱️ Notre équipe est en train de vous rattacher à l’organisation **${libelle}**.
Vous recevrez un email pour accéder à votre démarche dès que nous aurons terminé.
(délai moyen : 1 jour ouvré)

Cordialement,
L’équipe MonComptePro
`.trim();
}
