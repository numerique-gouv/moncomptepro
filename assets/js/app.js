import "@gouvfr/dsfr/dist/core/core.module";
import "@gouvfr/dsfr/dist/component/navigation/navigation.module";
import "@gouvfr/dsfr/dist/component/modal/modal.module";
import "@gouvfr/dsfr/dist/component/header/header.module";
import { announceNotifications, explainExternalLinks } from "./modules/screen-reader";
import { disableFormsOnSubmit } from "./modules/disable-on-submit";
import "./modules/load-bar";

document.addEventListener("DOMContentLoaded", () => {
  announceNotifications();
  explainExternalLinks();
  disableFormsOnSubmit();
});
