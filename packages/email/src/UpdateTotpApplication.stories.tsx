//

import type { ComponentAnnotations, Renderer } from "@storybook/csf";
import UpdateTotpApplication, { type Props } from "./UpdateTotpApplication";

//

export default {
  title: "Update totp application",
  render: UpdateTotpApplication,
  args: {
    given_name: "Marie",
    family_name: "Dupont",
    support_email: "contact@moncomptepro.beta.gouv.fr",
    baseurl: "http://localhost:3000",
  },
} as ComponentAnnotations<Renderer, Props>;
