document.addEventListener("DOMContentLoaded", function() {
  var password_input = document.getElementById("password-input");
  var password_show = document.getElementById("password-show");

  function toggleShowPassword() {
    if (password_input.type === "password") {
      password_input.type = "text";
    } else {
      password_input.type = "password";
    }
  }

  password_show.addEventListener("click", toggleShowPassword);
}, false);
