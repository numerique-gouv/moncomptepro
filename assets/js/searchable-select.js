import Choices from "choices.js"

document.addEventListener("DOMContentLoaded", function() {
  var searchable_select = document.getElementById("searchable-select");
  var choices = new Choices(searchable_select, {
    noResultsText: "Aucun résultat trouvé",
    itemSelectText: "",
    classNames : {
      containerInner: 'fr-select'
    }
  })
}, false);
