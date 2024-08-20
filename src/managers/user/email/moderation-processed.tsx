//

import { MONCOMPTEPRO_HOST } from "../../../config/env";
import { Layout, Text } from "../../../connectors/brevo.tempate-email";

//

export function moderation_processed_mail({ libelle }: { libelle: string }) {
  return (
    <Layout>
      <Text safe>
        Bonjour,
        <br />
        <br />
        Votre demande pour rejoindre l’organisation « ${libelle} » a été
        débloquée sur ${MONCOMPTEPRO_HOST}.
        <br />
        <br />
        Vous pouvez à présent retourner sur votre démarche ou demande.
        <br />
        <br />
        Nous restons à votre disposition pour toute information complémentaire.
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
