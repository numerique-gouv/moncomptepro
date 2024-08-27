//
// NOTE(douglasduteil): app related oidc-provider types
// Those interfaces override the type which is incomplete in the original lib
//

import type {
  InteractionResults,
  OIDCContext,
  UnknownObject,
} from "oidc-provider";

/**
 * Extends the {@link OIDCContext.params} type.
 * Should be used instead of KoaContextWithOIDC["oidc"]["params"]
 */
export interface OIDCContextParams extends UnknownObject {
  scope: string;
  prompt: "select_organization" | "update_userinfo";
}

/**
 * Extends the {@link OIDCContext.result} type.
 */
export interface OidcInteractionResults extends InteractionResults {
  select_organization?: boolean;
  update_userinfo?: boolean;
}
