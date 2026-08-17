/* Quick view: opens a condensed product panel over the homepage without navigating
   away, triggered by the eye icon on each product card (visible on hover on desktop,
   always visible on touch devices where hover doesn't exist). Reuses the same buying
   widget as the full product page via js/product-view.js, so size selection,
   quantity, and add-to-cart behave identically in both places. Homepage-only: no-ops
   if the modal markup isn't on the page. */
(function () {
  "use strict";

  var modal = document.querySelector("[data-quickview]");
  if (!modal) return;

  var scrim = document.querySelector("[data-quickview-scrim]");
  var panel = modal.querySelector(".quickview-panel");
  var fullLink = modal.querySelector("[data-quickview-full]");
  var lastFocus = null;

  function show(el, cls) {
    el.hidden = false;
    requestAnimationFrame(function () { el.classList.add(cls); });
  }
  function hide(el, cls) {
    el.classList.remove(cls);
    var done = function () { el.hidden = true; };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return done();
    setTimeout(done, 300);
  }

  function open(slug) {
    var products = window.VervainProducts;
    var product = products ? products.get(slug) : null;
    if (!product || !window.VervainProductView) return;

    lastFocus = document.activeElement;
    window.VervainProductView.mount(panel, product);
    if (fullLink) fullLink.href = "/products/" + product.slug;

    show(scrim, "is-on");
    show(modal, "is-on");
    document.body.style.overflow = "hidden";
    var close = modal.querySelector("[data-quickview-close]");
    if (close) close.focus();
  }

  function close() {
    hide(modal, "is-on");
    hide(scrim, "is-on");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-quickview-open]");
    if (trigger) {
      e.preventDefault(); // it lives inside a stretched-link card; don't also navigate
      e.stopPropagation();
      open(trigger.dataset.slug);
      return;
    }
    if (e.target.closest("[data-quickview-close]") || e.target === scrim) close();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) close();
  });
})();
