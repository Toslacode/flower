/* Renders a single product page from js/products.js, keyed by the slug in the URL
   (/products/:slug, served for every slug by product.html via the Vercel rewrite in
   vercel.json). One template for every product; there is no per-product markup.
   Depends on window.VervainProducts (js/products.js) and window.VervainCart
   (js/shop.js), both loaded earlier as defer scripts, so they are ready by the time
   this runs. */
(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };
  var money = function (n) { return "₪" + n.toLocaleString("he-IL"); };

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

  // ---------- populate static fields ----------

  document.title = product.name + " · ורבנה";
  var metaDesc = $('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", product.name + " — " + product.desc);

  $("[data-pd-cat]").textContent = products.catLabel[product.cat] || "";
  $("[data-pd-name]").textContent = product.name;
  $("[data-pd-desc]").textContent = product.desc;

  var compWrap = $("[data-pd-composition-wrap]");
  if (product.composition) {
    compWrap.hidden = false;
    $("[data-pd-composition]").textContent = product.composition;
  }

  var availEl = $("[data-pd-availability]");
  availEl.textContent = product.availability.text;
  availEl.className = "pd-availability pd-availability--" + (product.availability.tone === "ok" ? "ok" : "custom");

  // ---------- gallery (structured for more than one image; none currently has one) ----------

  var mainImg = $("[data-pd-image]");
  var thumbsWrap = $("[data-pd-thumbs]");
  mainImg.src = product.images[0];
  mainImg.alt = product.name;

  if (product.images.length > 1) {
    thumbsWrap.hidden = false;
    product.images.forEach(function (src, i) {
      var t = document.createElement("button");
      t.type = "button";
      t.className = "pd-thumb" + (i === 0 ? " is-on" : "");
      var im = document.createElement("img");
      im.src = src;
      im.alt = "";
      im.loading = "lazy";
      t.appendChild(im);
      t.addEventListener("click", function () {
        mainImg.src = src;
        $$(".pd-thumb", thumbsWrap).forEach(function (x) { x.classList.toggle("is-on", x === t); });
      });
      thumbsWrap.appendChild(t);
    });
  }

  // ---------- size selection ----------

  var sizesWrap = $("[data-pd-sizes-wrap]");
  var sizesEl = $("[data-pd-sizes]");
  var priceEl = $("[data-pd-price]");
  var addLabelEl = $("[data-pd-add-label]");
  var stickyPriceEl = $("[data-pd-sticky-price]");

  var selectedSizeId = product.defaultSizeId;

  function variantFor(id) {
    for (var i = 0; i < product.sizes.length; i++) if (product.sizes[i].id === id) return product.sizes[i];
    return product.sizes[0];
  }

  function updatePrice() {
    var variant = variantFor(selectedSizeId);
    priceEl.textContent = money(variant.price);
    addLabelEl.textContent = "הוספה לסל · " + money(variant.price);
    stickyPriceEl.textContent = money(variant.price);
  }

  if (product.sizes.length > 1) {
    sizesWrap.hidden = false;
    product.sizes.forEach(function (size) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip pd-size-btn" + (size.id === selectedSizeId ? " is-on" : "");
      b.textContent = size.label;
      b.addEventListener("click", function () {
        selectedSizeId = size.id;
        $$(".pd-size-btn", sizesEl).forEach(function (x) { x.classList.toggle("is-on", x === b); });
        updatePrice();
      });
      sizesEl.appendChild(b);
    });
  }
  updatePrice();

  // ---------- quantity ----------

  var qty = 1;
  var qtyOut = $("[data-pd-qty]");
  function setQty(n) {
    qty = Math.max(1, n);
    qtyOut.textContent = String(qty);
  }
  $("[data-pd-qty-minus]").addEventListener("click", function () { setQty(qty - 1); });
  $("[data-pd-qty-plus]").addEventListener("click", function () { setQty(qty + 1); });

  // ---------- add to cart ----------

  function handleAdd() {
    var variant = variantFor(selectedSizeId);
    var cart = window.VervainCart;
    if (!cart) return;
    cart.add({
      id: product.slug,
      size: variant.id,
      sizeLabel: product.sizes.length > 1 ? variant.label : "",
      name: product.name,
      price: variant.price,
      qty: qty,
      img: product.images[0],
    });
    cart.notifyAdded(product.name, product.sizes.length > 1 ? variant.label : "");
    setQty(1);
  }

  $("[data-pd-add]").addEventListener("click", handleAdd);
  $("[data-pd-add-sticky]").addEventListener("click", handleAdd);

  // Reveal once populated: same entrance language as the hero (anim-rise/anim-fade,
  // already reduced-motion aware), just applied here instead of re-invented.
  $(".pd-gallery").classList.add("anim-fade");
  $$(".pd-info > *").forEach(function (el, i) {
    el.classList.add("anim-rise");
    el.style.setProperty("--d", String(i));
  });
  root.hidden = false;
})();
