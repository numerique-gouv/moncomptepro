document.addEventListener(
  "DOMContentLoaded",
  function () {
    var password = document.getElementById("password-input");
    var confirm_password = document.getElementById("confirm_password");
    var confirm_password_sr_error = document.getElementById(
      "password-confirmation-error",
    );

    function validatePassword() {
      if (confirm_password.value && password.value !== confirm_password.value) {
        const errorMessage = "Les mots de passe ne sont pas identiques";
        confirm_password.setCustomValidity(errorMessage);
        confirm_password_sr_error.textContent = errorMessage;
      } else {
        confirm_password.setCustomValidity("");
        confirm_password_sr_error.textContent = "";
      }
    }

    password.onchange = validatePassword;
    confirm_password.oninput = validatePassword;
  },
  false,
);
