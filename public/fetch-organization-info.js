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
          var response = JSON.parse(xmlhttp.response);
          var nom = response.etablissement.unite_legale.nom;
          var prenom_1 = response.etablissement.unite_legale.prenom_1;
          var prenom_2 = response.etablissement.unite_legale.prenom_2;
          var prenom_3 = response.etablissement.unite_legale.prenom_3;
          var prenom_4 = response.etablissement.unite_legale.prenom_4;
          var nom_prenom = (nom ? nom + "*" : "") +
            (prenom_1 ? prenom_1 : "") +
            (prenom_2 ? " " + prenom_2 : "") +
            (prenom_3 ? " " + prenom_3 : "") +
            (prenom_4 ? " " + prenom_4 : "");
          var organizationLabel =
            response.etablissement.unite_legale.denomination ||
            response.etablissement.denomination_usuelle ||
            nom_prenom;
          organizationInfoElement.innerHTML = "Organisation : " + organizationLabel;
          if (response.etablissement.etat_administratif === 'A') {
            organizationInfoElement.classList.add("info");
          } else {
            organizationInfoElement.classList.add("error");
            organizationInfoElement.innerHTML += " (État administratif de l'établissement : fermé)"
          }

        } else if (xmlhttp.status === 404) {
          organizationInfoElement.style.display = 'block';
          organizationInfoElement.classList.add("error");
          organizationInfoElement.innerHTML = "Nous n'avons pas trouvé votre organisation.";
        } else {
          organizationInfoElement.style.display = 'block';
          organizationInfoElement.classList.add("error");
          organizationInfoElement.innerHTML =
            "Erreur inconnue lors de la récupération des informations de cet établissement. " +
            "Merci de réessayer ultérieurement. " +
            "Vous pouvez également nous signaler cette erreur par mail à contact@api.gouv.fr."
        }
      }
    };

    xmlhttp.open("GET", "https://entreprise.data.gouv.fr/api/sirene/v3/etablissements/" + siret, true);
    xmlhttp.send();
  }

  clearOrganizationInfo();
  showOrganizationInfo();

  siretSelectorElement.addEventListener("input", showOrganizationInfo, false);
}, false);
