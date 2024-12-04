//

import { convert } from "html-to-text";
import { createTransport, type SendMailOptions } from "nodemailer";
import { DEPLOY_ENV, SMTP_URL } from "../config/env";

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
  const subject = computeMailSubject(options.subject);

  return transporter.sendMail({
    text:
      typeof options.html === "string" ? convert(options.html) : options.text,
    headers: [...tag],
    ...options,
    subject,
    from: "nepasrepondre@email.moncomptepro.beta.gouv.fr",
  });
}

function computeMailSubject(
  initialSubject: SendMailBrevoOptions["subject"],
): SendMailBrevoOptions["subject"] {
  if (initialSubject === undefined) {
    return undefined;
  }

  switch (DEPLOY_ENV) {
    case "localhost":
      return `Local - ${initialSubject}`;
    case "sandbox":
      return `Test - ${initialSubject}`;
    case "preview":
      return `Test - ${initialSubject}`;
  }
  return initialSubject;
}
