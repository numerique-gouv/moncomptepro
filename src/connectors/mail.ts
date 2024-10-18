//

import { convert } from "html-to-text";
import { createTransport, type SendMailOptions } from "nodemailer";
import { SMTP_URL } from "../config/env";

//

const transporter = createTransport({
  url: SMTP_URL,
});

//

export function sendMail(options: Omit<SendMailOptions, "from">) {
  return transporter.sendMail({
    text:
      typeof options.html === "string" ? convert(options.html) : options.text,
    ...options,
    from: "nepasrepondre@email.moncomptepro.beta.gouv.fr",
  });
}
