//
// NOTE(douglasduteil): add missing tag attributes for mails
// \see https://github.com/kitajs/html/pull/275
//
declare namespace JSX {
  interface HtmlTableTag extends HtmlTag {
    align?: undefined | "left" | "center" | "right";
    border?: undefined | number;
    cellpadding?: undefined | number | string;
    cellspacing?: undefined | number | string;
    width?: undefined | number | string;
  }

  interface HtmlImageTag extends HtmlTag {
    border?: undefined | number;
  }

  interface HtmlTableHeaderCellTag extends HtmlTag {
    width?: undefined | number | string;
    valign?: undefined | "top" | "middle" | "bottom" | "baseline";
  }

  interface HtmlTableDataCellTag extends HtmlTag {
    valign?: undefined | "top" | "middle" | "bottom" | "baseline";
    align?: undefined | "left" | "center" | "right";
  }
}
