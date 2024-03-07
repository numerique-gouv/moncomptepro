export const disableFormsOnSubmit = () => {
  // Flag to control form submission
  let disableFormSubmission = false;

  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", function (event) {
      const buttons = document.querySelectorAll("button");

      // Temporarily disable form submission
      if (disableFormSubmission) {
        event.stopPropagation();
        event.preventDefault();
      } else {
        disableFormSubmission = true;
      }

      // Disable all buttons to prevent further clicks
      buttons.forEach((button) => {
        button.disabled = true;
      });
    });
  });
};
