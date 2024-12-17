document.addEventListener(
  "DOMContentLoaded",
  function () {
    const elements = document.querySelectorAll(".disabled-with-countdown");

    elements.forEach((element) => {
      const rawEndDate = element.getAttribute("data-countdown-end-date");
      try {
        const endDateInSeconds = new Date(rawEndDate).getTime() / 1000;
        const nowInSeconds = new Date().getTime() / 1000;
        let secondsToEndDate = Math.round(endDateInSeconds - nowInSeconds);
        let intervalId;

        element.disabled = true;

        function updateButtonText() {
          const minutes = Math.floor(secondsToEndDate / 60);
          const seconds = String(secondsToEndDate % 60).padStart(2, "0");
          element.textContent = `Recevoir un nouvel email (disponible dans ${minutes}:${seconds})`;
        }

        updateButtonText();

        intervalId = setInterval(function () {
          secondsToEndDate--;

          if (secondsToEndDate > 0) {
            updateButtonText();
          } else {
            element.disabled = false;
            element.textContent = "Recevoir un nouvel email";
            clearInterval(intervalId);
          }
        }, 1000);
      } catch (error) {
        // silently fails
      }
    });
  },
  false,
);
