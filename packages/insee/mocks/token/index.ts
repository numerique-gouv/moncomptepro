//

import { http, HttpResponse, passthrough } from "msw";

//

export const get_token = http.post("https://api.insee.fr/token", () => {
  // NOTE(douglasduteil): As a valid token is required to make the other requests,
  // when updating we do not mock the api request.
  if (process.env["UPDATE_SNAPSHOT"]) return passthrough();

  return HttpResponse.json({
    access_token: "__INSEE_API_ACCESS_TOKEN__",
    scope: "am_application_scope default",
    token_type: "Bearer",
    expires_in: 604800,
  });
});
