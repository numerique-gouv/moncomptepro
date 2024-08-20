//

import type { PropsWithChildren } from "@kitajs/html";
import { MONCOMPTEPRO_HOST } from "../config/env";

//

const fontFamily = '"Source Sans Pro","Verdana",Geneva,sans-serif';

export function Layout({ children }: PropsWithChildren) {
  return (
    <Html>
      <Header />
      <Section
        style={{
          backgroundColor: "#ffffff",
          paddingBottom: "20",
          paddingLeft: "20",
          paddingRight: "20",
          paddingTop: "20",
        }}
      >
        {children}
      </Section>
      <Footer />
    </Html>
  );
}

export function Link(attributes: PropsWithChildren<JSX.HtmlAnchorTag>) {
  const { children, href, style, ...props } = attributes;
  return (
    <a
      href={href}
      {...props}
      style={{
        color: "rgb(0, 0, 145)",
        fontFamily,
        fontSize: "14px",
        lineHeight: "24px",
        margin: "16px 0",
        textDecoration: "underline",
      }}
    >
      {children}
    </a>
  );
}

export function Text(attributes: PropsWithChildren<JSX.HtmlTag>) {
  return (
    <p
      style={{
        margin: 0,
        fontFamily,
        fontSize: "14px",
        color: "#3c4858",
      }}
      {...attributes}
    />
  );
}

//

function Html(attributes: PropsWithChildren<JSX.HtmlHtmlTag>) {
  const { children, style, ...props } = attributes;
  return (
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style={{ backgroundColor: "#ffffff", paddingTop: "25px" }}>
        <Section
          style={{
            margin: "10px auto",
            maxWidth: "37.5em",
          }}
        >
          {children}
        </Section>
      </body>
    </html>
  );
}

function Section(attributes: PropsWithChildren<JSX.HtmlTableTag>) {
  const { children, style, ...props } = attributes;
  return (
    <table
      align="center"
      width="100%"
      {...props}
      border={0}
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style={style ?? ""}
    >
      <tbody>
        <tr>
          <td>{children}</td>
        </tr>
      </tbody>
    </table>
  );
}

function Header() {
  return (
    <Section
      style={{
        backgroundColor: "#ffffff",
        paddingBottom: "20px",
        paddingTop: "20px",
        width: "100%",
        tableLayout: "fixed",
        borderCollapse: "collapse",
      }}
    >
      <a
        href={MONCOMPTEPRO_HOST}
        target="_blank"
        style={{
          color: "#0092ff",
          textDecoration: "underline",
        }}
      >
        <img
          src="https://r.email.moncomptepro.beta.gouv.fr/im/7099183/17ff8987c68213153af13626e8a9939852ef66f746c80ce54379d23124edffe6.png?e=fNecfKb1RxTllfCvHFTKZ7oLLMa_TzVQCthtFn701qAAKuyVvBAfcffAKaoSsiQBwLxV30IBGyxdL8zO-8d85Zvov6syLv7XuJVxl0xjNYmMuHQVU3Uy2xy9IZqGRxeoELzef0OBDEdxwDcg_-yrpEHu16IGI7UkZmp7wEE5VARsRjIId4kwguHwpTNLjh_NLLY9LPZh8aWWaZcux8Ik9DokD92pxcefyP5WbACfjvE_Sm6I8wlgVwjeTPxKZKXC0BGZ0ndof2o6e2-eYCC2XU7mAHPsrd43GQPyLcG7eyX2TWKeMAwLzJHmMemAeaWAXuyaf9rWNwLhA1311BbnaRZb-7eKbsRCkcqyaVxDrnPQ9Cbn0pc"
          width={590}
          alt="Mon Compte Pro"
          border={0}
          style={{
            display: "block",
            width: "100%",
          }}
        />
      </a>
    </Section>
  );
}

function Footer() {
  return (
    <Section
      style={{
        backgroundColor: "#f5f5fe",
        paddingBottom: "20",
        paddingLeft: "20",
        paddingRight: "20",
        paddingTop: "20",
      }}
    >
      <div>
        <p
          style={{
            color: "#3c4858",
            fontFamily: "Arial,Helvetica,sans-serif",
            fontSize: "14px",
            lineHeight: "24px",
            margin: 0,
            textAlign: "center",
          }}
        >
          <span>
            <span>
              MonComptePro est la solution d'identification des professionnels
              du privé ou du public&nbsp;créé par la DINUM.
            </span>
          </span>
          <br />
          <span>
            <a
              href={MONCOMPTEPRO_HOST}
              style={{
                color: "#3c4858",
                textDecoration: "underline",
              }}
            >
              <span
                style={{
                  textDecoration: "underline",
                  color: "rgb(102, 102, 102)",
                }}
              >
                En savoir plus
              </span>
            </a>
          </span>
        </p>
      </div>
    </Section>
  );
}
