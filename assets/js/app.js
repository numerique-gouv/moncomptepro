import { explainExternalLinks } from "./modules/sr-external-links";
import { disableFormsOnSubmit } from "./modules/disable-on-submit";
import './modules/load-bar';

document.addEventListener("DOMContentLoaded", () => {
  explainExternalLinks();
  disableFormsOnSubmit();
});
