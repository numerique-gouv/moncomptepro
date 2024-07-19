document.addEventListener(
  "DOMContentLoaded",
  function () {
    document
      .querySelectorAll(".js-password-container__toggle")
      .forEach((checkbox) => {
        const container = checkbox.closest(".js-password-container");
        if (!container) {
          return;
        }
        const input = container.querySelector(".js-password-container__input");
        if (!input) {
          return;
        }
        checkbox.addEventListener("click", () => {
          input.type = checkbox.checked ? "text" : "password";
        });
      });
  },
  false,
);
