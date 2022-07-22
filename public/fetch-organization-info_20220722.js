document.addEventListener("DOMContentLoaded", function() {
  var organizationInfoElement = document.getElementById("organization-info");
  var siretSelectorElement = document.getElementById("siret-selector");

  function clearOrganizationInfo() {
    organizationInfoElement.classList.remove("fr-alert--error");
    organizationInfoElement.classList.remove("fr-alert--info");
    organizationInfoElement.style.display = "none";
    organizationInfoElement.innerHTML = "";
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

    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState === XMLHttpRequest.DONE) { // XMLHttpRequest.DONE == 4
        if (xmlhttp.status === 200) {
          organizationInfoElement.style.display = "block";
          var response = JSON.parse(xmlhttp.response);
          var organization_label = response.organizationInfo.organization_label
          var statut_diffusion = response.organizationInfo.statut_diffusion
          var etat_administratif = response.organizationInfo.etat_administratif

          organizationInfoElement.innerHTML = 'Organisation : ' + organization_label;
          if (statut_diffusion === "N") {
            organizationInfoElement.classList.add("fr-alert--error");
            organizationInfoElement.innerHTML += " (Cet établissement est non-diffusible. Merci de le rendre diffusible pour pouvoir vous créer un compte. <a href='https://annuaire-entreprises.data.gouv.fr/etablissement/" + siret + "'>Plus d'info.</a>)";
          } else if (etat_administratif === "A") {
            organizationInfoElement.classList.add("fr-alert--info");
          } else {
            organizationInfoElement.classList.add("fr-alert--error");
            organizationInfoElement.innerHTML += " (État administratif de l'établissement : fermé)";
          }

        } else if (xmlhttp.status === 404) {
          organizationInfoElement.style.display = "block";
          organizationInfoElement.classList.add("fr-alert--error");
          organizationInfoElement.innerHTML = "Nous n'avons pas trouvé votre organisation.";
        } else {
          organizationInfoElement.style.display = "block";
          organizationInfoElement.classList.add("fr-alert--error");
          organizationInfoElement.innerHTML =
            "Erreur inconnue lors de la récupération des informations de cet établissement. " +
            "Merci de réessayer ultérieurement. " +
            "Vous pouvez également nous signaler cette erreur par mail à contact@api.gouv.fr.";
        }
      }
    };

    xmlhttp.open("GET", "/api/organization-info?siret=" + siret, true);
    xmlhttp.send();
  }

  clearOrganizationInfo();
  showOrganizationInfo();

  siretSelectorElement.addEventListener("input", showOrganizationInfo, false);
}, false);
