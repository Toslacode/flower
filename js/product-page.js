/* Renders a single product page from js/products.js, keyed by the slug in the URL
   (/products/:slug, served for every slug by product.html via the Vercel rewrite in
   vercel.json). One template for every product; there is no per-product markup.
   The core buying widget (gallery, price, size, qty, add-to-cart) is shared with the
   homepage's quick-view modal via js/product-view.js; this file only handles what's
   specific to the full page: the URL, the document title, and the breadcrumb/SKU/
   occasion/delivery content that the condensed quick-view deliberately skips. */
(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  function slugFromUrl() {
    var params = new URLSearchParams(location.search);
    if (params.get("slug")) return params.get("slug"); // local/no-rewrite testing fallback
    var m = location.pathname.match(/\/products\/([^/]+)\/?$/);
    return m ? decodeURIComponent(m[1]) : "";
  }

  var products = window.VervainProducts;
  var product = products ? products.get(slugFromUrl()) : null;

  var root = $("[data-product-root]");
  var missing = $("[data-pd-missing]");

  if (!product) {
    if (missing) missing.hidden = false;
    document.title = "המוצר לא נמצא · ורבנה";
    return;
  }

  document.title = product.name + " · ורבנה";
  var metaDesc = $('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", product.name + " — " + product.desc);

  // Breadcrumb
  var crumbCat = $("[data-pd-crumb-cat]");
  var crumbName = $("[data-pd-crumb-name]");
  if (crumbCat) {
    crumbCat.textContent = products.catLabel[product.cat] || "";
    crumbCat.href = "/#products";
  }
  if (crumbName) crumbName.textContent = product.name;

  // SKU
  var skuEl = $("[data-pd-sku]");
  if (skuEl && product.sku) skuEl.textContent = "מק\"ט " + product.sku;

  // Occasion tags
  var occWrap = $("[data-pd-occasions-wrap]");
  var occEl = $("[data-pd-occasions]");
  if (occWrap && occEl && product.occasions && product.occasions.length) {
    occWrap.hidden = false;
    product.occasions.forEach(function (tag) {
      var span = document.createElement("span");
      span.className = "chip-static";
      span.textContent = tag;
      occEl.appendChild(span);
    });
  }

  // The shared buying widget: gallery, price, size, qty, add-to-cart. Scoped to the
  // whole document, not just [data-product-root] -- the mobile sticky CTA bar
  // (data-pd-sticky-price / data-pd-add-sticky) is deliberately a sibling of <main>,
  // not nested inside it, so it stays fixed to the viewport rather than the page's
  // scrollable content.
  window.VervainProductView.mount(document, product);

  // Reveal once populated: same entrance language as the hero (anim-rise/anim-fade,
  // already reduced-motion aware), just applied here instead of re-invented.
  var gallery = $(".pd-gallery", root);
  if (gallery) gallery.classList.add("anim-fade");
  $$(".pd-info > *", root).forEach(function (el, i) {
    el.classList.add("anim-rise");
    el.style.setProperty("--d", String(i));
  });
  root.hidden = false;
})();
