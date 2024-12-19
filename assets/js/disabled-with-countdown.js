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

        if (isNaN(endDateInSeconds)) {
          console.error("Invalid date provided in data-countdown-end-date.");
          return;
        }

        if (secondsToEndDate > 0) {
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
              clearInterval(intervalId);
              element.disabled = false;
              element.textContent = "Recevoir un nouvel email";
            }
          }, 1000);
        } else {
          element.disabled = false;
          element.textContent = "Recevoir un nouvel email";
        }
      } catch (error) {
        // silently fails
      }
    });
  },
  false,
);
