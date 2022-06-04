document.addEventListener("DOMContentLoaded", function () {
  var password = document.getElementById("password");
  var confirm_password = document.getElementById("confirm_password");

  function validatePassword() {
    if (password.value !== confirm_password.value) {
      confirm_password.setCustomValidity("Les mots de passe ne sont pas identiques");
    } else {
      confirm_password.setCustomValidity("")
    }
  }

  password.onchange = validatePassword;
  confirm_password.oninput = validatePassword;
}, false);
