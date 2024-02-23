document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll("form").forEach(function(formElement) {
    var submitId = formElement.id.replace("form-", "submit-");
    document.getElementById(submitId).addEventListener("click", function(e) {
      e.stopPropagation();
      e.preventDefault();
      formElement.requestSubmit();
    });
  });

}, false);
