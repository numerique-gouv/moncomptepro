//

import { HOST } from "../../config/env";

//

export function unableToAutoJoinOrganizationMd({
  libelle,
}: {
  libelle: string;
}) {
  return `
![MonComptePro](${HOST}/dist/mail-proconnect.png)

Bonjour,

⏱️ Notre équipe est en train de vous rattacher à l’organisation **${libelle}**.
Vous recevrez un email pour accéder à votre démarche dès que nous aurons terminé.
(délai moyen : 1 jour ouvré)

Cordialement,
L’équipe ProConnect
`.trim();
}
