//

import type { Email } from "mailslurp-client";

//

export const getMagicLinkFromEmail = (email: Email) => {
  const matches = /.*<a href="([^"]+)" class="r13-r default-button".*/.exec(
    email.body ?? "",
  );
  if (matches && matches.length > 0) {
    return matches[1];
  }
  throw new Error("Could not find connection link in received email");
};
