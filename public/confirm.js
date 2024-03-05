document.addEventListener("DOMContentLoaded", function() {
  const elements = document.querySelectorAll('.js-confirm');

  elements.forEach(element => {
    element.addEventListener("click", function(event) {
      if (!confirm(element.getAttribute('data-confirm'))) {
        event.preventDefault();
      }
    });
  });
}, false);
