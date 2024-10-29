//

import { convert } from "html-to-text";
import { createTransport, type SendMailOptions } from "nodemailer";
import { SMTP_URL } from "../config/env";

//

const transporter = createTransport({
  url: SMTP_URL,
});

//

interface SendMailBrevoOptions extends Omit<SendMailOptions, "from"> {
  tag?: string;
}
export function sendMail(options: SendMailBrevoOptions) {
  const tag = options.tag ? [{ key: "X-Mailin-Tag", value: options.tag }] : [];

  return transporter.sendMail({
    text:
      typeof options.html === "string" ? convert(options.html) : options.text,
    headers: [...tag],
    ...options,
    from: "nepasrepondre@email.moncomptepro.beta.gouv.fr",
  });
}
