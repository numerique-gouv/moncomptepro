import { debounce } from "./modules/debounce";

document.addEventListener(
  "DOMContentLoaded",
  function () {
    var organizationInfoElement = document.getElementById("organization-info");
    var organizationInfoLibelleElement = document.getElementById(
      "organization-info-libelle",
    );
    var organizationInfoAdresseElement = document.getElementById(
      "organization-info-adresse",
    );
    var organizationInfoActivitePrincipaleElement = document.getElementById(
      "organization-info-activite-principale",
    );
    var organizationAlertElement =
      document.getElementById("organization-alert");
    var organizationAlertContentElement =
      organizationAlertElement.querySelector(".alert--content");
    var siretSelectorElement = document.getElementById("siret-selector");
    var submitElement = document.querySelector('button[type="submit"]');

    function clearOrganizationInfo() {
      organizationInfoElement.style.display = "none";
      organizationInfoLibelleElement.innerHTML = "";
      organizationInfoAdresseElement.innerHTML = "";
      organizationInfoActivitePrincipaleElement.innerHTML = "";
      organizationAlertElement.style.display = "none";
      organizationAlertContentElement.innerHTML = "";
      submitElement.removeAttribute("aria-label");
      siretSelectorElement.removeAttribute("aria-describedby");
    }

    function showOrganizationInfo() {
      clearOrganizationInfo();

      var rawSiret = siretSelectorElement.value;
      var siretRegex = RegExp(/^(\s*\d){14}$/);
      if (!siretRegex.test(rawSiret)) {
        // if siret is not of a valid format do not make the ajax call
        return null;
      }

      var siret = rawSiret.replace(/\s*/g, "");

      var xmlhttp = new XMLHttpRequest();

      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
          // XMLHttpRequest.DONE == 4
          if (xmlhttp.status === 200) {
            var response = JSON.parse(xmlhttp.response);
            var libelle = response.organizationInfo.libelle;
            var adresse = response.organizationInfo.adresse;
            var libelleActivitePrincipale =
              response.organizationInfo.libelleActivitePrincipale;
            var estActive = response.organizationInfo.estActive;
            if (estActive) {
              organizationInfoElement.style.display = "block";
              organizationInfoLibelleElement.innerHTML = libelle;
              organizationInfoLibelleElement.setAttribute(
                "aria-label",
                "Organisation correspondante au SIRET donné : " + libelle,
              );
              submitElement.setAttribute(
                "aria-label",
                "Enregistrer l'organisation " + libelle,
              );
              organizationInfoAdresseElement.innerHTML = adresse;
              organizationInfoActivitePrincipaleElement.innerHTML =
                libelleActivitePrincipale;
              siretSelectorElement.removeAttribute("aria-describedby");
            } else {
              organizationAlertElement.style.display = "block";
              organizationAlertContentElement.innerHTML =
                "État administratif de l'établissement : fermé";
              siretSelectorElement.setAttribute(
                "aria-describedby",
                organizationAlertElement.id,
              );
            }
          } else if (xmlhttp.status === 404) {
            organizationAlertElement.style.display = "block";
            organizationAlertContentElement.innerHTML =
              "Nous n'avons pas trouvé votre organisation.";
          } else if (xmlhttp.status === 504) {
            // fail silently
          } else {
            organizationAlertElement.style.display = "block";
            organizationAlertContentElement.innerHTML =
              "Erreur inconnue lors de la récupération des informations de cet établissement. " +
              "Merci de réessayer ultérieurement. " +
              "Vous pouvez également nous signaler cette erreur par mail à support+identite@proconnect.gouv.fr.";
          }
          if (xmlhttp.status !== 200) {
            submitElement.removeAttribute("aria-label");
            siretSelectorElement.setAttribute(
              "aria-describedby",
              organizationAlertElement.id,
            );
          }
        }
      };

      xmlhttp.open("GET", "/api/sirene/organization-info/" + siret, true);
      xmlhttp.send();
    }

    const debouncedShowOrganizationInfo = debounce(showOrganizationInfo, 250);

    clearOrganizationInfo();
    showOrganizationInfo();

    siretSelectorElement.addEventListener(
      "input",
      debouncedShowOrganizationInfo,
      false,
    );
  },
  false,
);
