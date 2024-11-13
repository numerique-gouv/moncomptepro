//

import { Layout, type LayoutProps } from "./_layout";
import { Text } from "./components";

//

export default function ModerationProcessed(props: Props) {
  const { baseurl, libelle } = props;
  return (
    <Layout baseurl={baseurl}>
      <Text safe>
        Bonjour, <br />
        <br />
        Votre demande pour rejoindre l’organisation « {libelle} » a été
        débloquée sur {baseurl}.
        <br />
        <br />
        Vous pouvez à présent retourner sur votre démarche ou demande.
        <br />
        <br />
        Nous restons à votre disposition pour toute information complémentaire.
      </Text>
    </Layout>
  );
}

//

export type Props = LayoutProps & {
  libelle: string;
};
