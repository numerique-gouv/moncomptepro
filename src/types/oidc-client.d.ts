// properties of OidcClients are defined here: https://openid.net/specs/openid-connect-registration-1_0.html#ClientMetadata
// properties id, client_description, created_at, updated_at, client_user_can_description are non-standard properties
interface OidcClient {
  id: number;
  client_description: string;
  // The "user can" description should be phrased as follows:
  // - meaningful in a sentence starting with "Les personnes suivantes on la possibilité de"
  // - meaningful in a sentence starting with "Cette personne peut"
  // - use the world "organisation" in a sentence that emphasis the way the action of the user affect the organization
  // ex: "effectuer des démarches sur <client_name> au nom de votre organisation"
  client_user_can_description?: string;
  created_at: Date;
  updated_at: Date;
  client_name: string;
  client_id: string;
  client_secret: string;
  redirect_uris: string[];
  post_logout_redirect_uris: string[];
  scope: string;
  client_uri: string;
}
