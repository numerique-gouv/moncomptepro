//

import type { PropsWithChildren } from "@kitajs/html";
import { fontFamily } from "./style";

//

export function Text(attributes: PropsWithChildren<JSX.HtmlTag>) {
  const { children, style, ...props } = attributes;

  return (
    <p
      style={{
        margin: 0,
        fontFamily,
        fontWeight: 400,
        lineHeight: "24px",
        fontSize: "16px",
        color: "#000",
        ...(style as object),
      }}
      {...props}
    >
      {children}
    </p>
  );
}
