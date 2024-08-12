//

import { createTransport, SendMailOptions } from "nodemailer";
import { SMTP_URL } from "../config/env";
import { convert } from "html-to-text";

//

const transporter = createTransport({
  url: SMTP_URL,
});

//

export function send(options: Omit<SendMailOptions, "from">) {
  return transporter.sendMail({
    text:
      typeof options.html === "string" ? convert(options.html) : options.text,
    ...options,
    from: "nepasrepondre@email.moncomptepro.beta.gouv.fr",
  });
}
