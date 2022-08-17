document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll("form").forEach(function(formElement) {
    var submitId = formElement.id.replace("form-", "submit-");
    document.getElementById(submitId).addEventListener("click", function(e) {
      console.log("Click click!", formElement.id);
      e.stopPropagation();
      e.preventDefault();
      formElement.submit();
    });
  });

}, false);
