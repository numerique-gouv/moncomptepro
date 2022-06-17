document.addEventListener("DOMContentLoaded", function() {
  var goBackLink = document.getElementById("go-back-link");

  function goBack() {
    history.back();
  }

  goBackLink.addEventListener("click", goBack);
}, false);
