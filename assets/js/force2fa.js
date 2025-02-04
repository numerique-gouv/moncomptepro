document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("2fa-form");

  if (!form) {
    console.error("Le formulaire 2FA n'a pas été trouvé.");
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const selectedValue = document.querySelector(
      "input[name='force2fa']:checked",
    )?.value;

    if (selectedValue) {
      if (selectedValue === "enable") {
        form.action = "/enable-force-2fa";
      } else if (selectedValue === "disable") {
        form.action = "/disable-force-2fa";
      }

      form.submit();
    }
  });
});
