document.addEventListener("DOMContentLoaded", function() {
  var input = document.getElementById("did-you-mean-input");
  var element = document.getElementById("did-you-mean-element");
  var link = document.getElementById("did-you-mean-link");

  function fillInputWithSuggestion(e) {
    e.stopPropagation();
    e.preventDefault();
    input.value = link.innerText;
    element.style.display = "none";
  }

  link.addEventListener("click", fillInputWithSuggestion);
}, false);
