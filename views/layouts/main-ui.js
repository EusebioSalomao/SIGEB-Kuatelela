(function () {
  "use strict";

  function initNavbarFallback() {
    var togglers = document.querySelectorAll('[data-bs-toggle="collapse"]');

    togglers.forEach(function (toggler) {
      toggler.addEventListener("click", function () {
        var targetSelector = toggler.getAttribute("data-bs-target");
        var target = document.querySelector(targetSelector);
        if (!target || window.bootstrap) return;

        var isOpen = target.classList.toggle("show");
        toggler.setAttribute("aria-expanded", String(isOpen));
      });
    });
  }

  function initCarousel() {
    var slider = document.getElementById("mainSlider");
    if (!slider) return;

    if (window.bootstrap && window.bootstrap.Carousel) {
      window.bootstrap.Carousel.getOrCreateInstance(slider, {
        interval: 6000,
        pause: "hover",
        touch: true,
        wrap: true
      });
      return;
    }

    var items = Array.prototype.slice.call(slider.querySelectorAll(".carousel-item"));
    var indicators = Array.prototype.slice.call(
      slider.querySelectorAll(".carousel-indicators button")
    );
    if (items.length < 2) return;

    var current = 0;
    window.setInterval(function () {
      items[current].classList.remove("active");
      if (indicators[current]) indicators[current].classList.remove("active");
      current = (current + 1) % items.length;
      items[current].classList.add("active");
      if (indicators[current]) indicators[current].classList.add("active");
    }, 6000);

    indicators.forEach(function (indicator, index) {
      indicator.addEventListener("click", function () {
        items[current].classList.remove("active");
        if (indicators[current]) indicators[current].classList.remove("active");
        current = index;
        items[current].classList.add("active");
        indicator.classList.add("active");
      });
    });
  }

  function initCountersCompatibility() {
    /*
     * A lógica de valores do projeto continua no /scripts.js.
     * Esta função apenas evita que os círculos fiquem vazios caso a
     * biblioteca ProgressBar não carregue.
     */
    var circles = document.querySelectorAll(".stat-circle");
    circles.forEach(function (circle, index) {
      if (!circle.textContent.trim() && !circle.querySelector("svg")) {
        circle.setAttribute("data-counter-index", String(index));
      }
    });
  }

  function init() {
    initNavbarFallback();
    initCarousel();
    initCountersCompatibility();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();