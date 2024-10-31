//

import type { ComponentAnnotations, Renderer } from "@storybook/csf";
import Add2fa, { type Props } from "./Add2fa";

//

export default {
  title: "Add 2FA",
  render: Add2fa,
  args: {
    given_name: "Marie",
    family_name: "Dupont",
    baseurl: "http://localhost:3000",
  } as Props,
} as ComponentAnnotations<Renderer, Props>;
