//

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
