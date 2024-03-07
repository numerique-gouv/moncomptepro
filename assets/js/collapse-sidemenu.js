document.addEventListener("DOMContentLoaded", function() {
  var sidemenuButtonElement = document.getElementById("fr-sidemenu-btn");
  var sidemenuWrapperElement = document.getElementById("fr-sidemenu-wrapper");

  function init() {
    sidemenuButtonElement.ariaExpanded = "false";
    sidemenuWrapperElement.style.setProperty("--collapser", "none");
    sidemenuWrapperElement.style.setProperty("--collapse-max-height", "none");
    var height = sidemenuWrapperElement.offsetHeight;
    sidemenuWrapperElement.style.setProperty("--collapse", -height + "px");
    sidemenuWrapperElement.style.removeProperty("--collapse-max-height");
    sidemenuWrapperElement.style.setProperty("--collapser", "");
  }

  function toggle_collapse() {
    if (sidemenuButtonElement.ariaExpanded === "false") {
      // on open
      sidemenuButtonElement.ariaExpanded = "true";
      sidemenuWrapperElement.style.setProperty("--collapse-max-height", "none");
      sidemenuWrapperElement.classList.add("fr-collapsing");
      sidemenuWrapperElement.classList.add("fr-collapse--expanded");
    } else {
      // on close
      sidemenuButtonElement.ariaExpanded = "false";
      sidemenuWrapperElement.classList.add("fr-collapsing");
      sidemenuWrapperElement.classList.remove("fr-collapse--expanded");
    }
  }

  function on_collapse_end() {
    sidemenuWrapperElement.classList.remove("fr-collapsing");
    if (sidemenuButtonElement.ariaExpanded === "false") {
      // on close
      sidemenuWrapperElement.style.removeProperty("--collapse-max-height");
    }
  }

  init();
  window.addEventListener("resize", init);
  if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", init);
  }
  sidemenuButtonElement.addEventListener("click", toggle_collapse);
  sidemenuWrapperElement.addEventListener("transitionend", on_collapse_end);
}, false);
