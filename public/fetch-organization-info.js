document.addEventListener('DOMContentLoaded', function () {
  var organizationInfoElement = document.getElementById("organization-info");
  var siretSelectorElement = document.getElementById("siret-selector");

  function clearOrganizationInfo() {
    organizationInfoElement.classList.remove("error");
    organizationInfoElement.classList.remove("info");
    organizationInfoElement.style.display = 'none';
    organizationInfoElement.innerHTML = "";
  }

  function showOrganizationInfo() {
    clearOrganizationInfo();

    var rawSiret = siretSelectorElement.value
    var siretRegex = RegExp(/^(\s*\d){14}$/)
    if (!siretRegex.test(rawSiret)) {
      // if siret is not of a valid format do not make the ajax call
      return null;
    }

    var siret = rawSiret.replace(/\s*/g, '');

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === XMLHttpRequest.DONE) { // XMLHttpRequest.DONE == 4
        if (xmlhttp.status === 200) {
          organizationInfoElement.style.display = 'block';
          organizationInfoElement.classList.add("info");
          const response = JSON.parse(xmlhttp.response);
          organizationInfoElement.innerHTML = "Entreprise : " + response.etablissement.nom_raison_sociale;
        } else if (xmlhttp.status === 404) {
          organizationInfoElement.style.display = 'block';
          organizationInfoElement.classList.add("error");
          organizationInfoElement.innerHTML = "Nous n'avons pas trouvé votre organisation.";
        }
      }
    };

    xmlhttp.open("GET", "https://entreprise.data.gouv.fr/api/sirene/v1/siret/" + siret, true);
    xmlhttp.send();
  }

  clearOrganizationInfo();
  showOrganizationInfo();

  siretSelectorElement.addEventListener("input", showOrganizationInfo, false);
}, false);
