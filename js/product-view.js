/* Shared "buying widget" renderer: image, category, name, starting-from price note,
   price, availability, description, composition, size picker, quantity, add-to-cart.
   Used by the full product page (product.html, one mount for the page's lifetime) and
   the homepage quick-view modal (index.html, remounted with a new product every time
   it opens). Depends on window.VervainProducts and window.VervainCart, both loaded
   earlier as defer scripts.

   `mount(scope, product)` looks for the standard data-pd-* hooks inside `scope` and
   fills whichever of them exist -- a scope missing data-pd-composition-wrap (the
   quick-view modal, deliberately more condensed than the full page) just skips that
   part instead of erroring, so both callers can share one implementation. */
(function () {
  "use strict";

  function money(n) { return "₪" + n.toLocaleString("he-IL"); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function mount(scope, product) {
    var els = {
      cat: $("[data-pd-cat]", scope),
      name: $("[data-pd-name]", scope),
      from: $("[data-pd-from]", scope),
      price: $("[data-pd-price]", scope),
      availability: $("[data-pd-availability]", scope),
      desc: $("[data-pd-desc]", scope),
      compWrap: $("[data-pd-composition-wrap]", scope),
      comp: $("[data-pd-composition]", scope),
      sizesWrap: $("[data-pd-sizes-wrap]", scope),
      sizesEl: $("[data-pd-sizes]", scope),
      qtyOut: $("[data-pd-qty]", scope),
      qtyMinus: $("[data-pd-qty-minus]", scope),
      qtyPlus: $("[data-pd-qty-plus]", scope),
      addBtn: $("[data-pd-add]", scope),
      stickyPrice: $("[data-pd-sticky-price]", scope),
      stickyAddBtn: $("[data-pd-add-sticky]", scope),
      image: $("[data-pd-image]", scope),
      thumbsWrap: $("[data-pd-thumbs]", scope),
    };

    var products = window.VervainProducts;
    var catLabel = (products && products.catLabel) || {};

    if (els.cat) els.cat.textContent = catLabel[product.cat] || "";
    if (els.name) els.name.textContent = product.name;
    if (els.desc) els.desc.textContent = product.desc;

    if (els.compWrap && els.comp) {
      els.compWrap.hidden = !product.composition;
      if (product.composition) els.comp.textContent = product.composition;
    }

    if (els.availability) {
      els.availability.textContent = product.availability.text;
      els.availability.className =
        "pd-availability pd-availability--" + (product.availability.tone === "ok" ? "ok" : "custom");
    }

    if (els.image) {
      els.image.src = product.images[0];
      els.image.alt = product.name;
    }
    if (els.thumbsWrap) {
      els.thumbsWrap.innerHTML = "";
      els.thumbsWrap.hidden = product.images.length <= 1;
      if (product.images.length > 1) {
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
            els.image.src = src;
            $$(".pd-thumb", els.thumbsWrap).forEach(function (x) { x.classList.toggle("is-on", x === t); });
          });
          els.thumbsWrap.appendChild(t);
        });
      }
    }

    if (els.from) {
      var multi = product.sizes.length > 1;
      els.from.hidden = !multi;
      if (multi) {
        var cheapest = product.sizes.reduce(function (a, b) { return a.price < b.price ? a : b; });
        els.from.textContent = "החל מ־" + money(cheapest.price);
      }
    }

    // Per-mount state, closed over by the listeners wired below. A fresh object each
    // call, so reopening the quick-view for a different product starts clean.
    var state = { sizeId: product.defaultSizeId, qty: 1 };

    function variantFor(id) {
      for (var i = 0; i < product.sizes.length; i++) if (product.sizes[i].id === id) return product.sizes[i];
      return product.sizes[0];
    }

    function updatePrice() {
      var v = variantFor(state.sizeId);
      if (els.price) els.price.textContent = money(v.price);
      if (els.stickyPrice) els.stickyPrice.textContent = money(v.price);
      var label = "הוספה לסל · " + money(v.price);
      $$("[data-pd-add-label]", scope).forEach(function (el) { el.textContent = label; });
    }

    if (els.sizesWrap && els.sizesEl) {
      els.sizesEl.innerHTML = "";
      els.sizesWrap.hidden = product.sizes.length <= 1;
      if (product.sizes.length > 1) {
        product.sizes.forEach(function (size) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "chip pd-size-btn" + (size.id === state.sizeId ? " is-on" : "");
          b.textContent = size.label;
          b.addEventListener("click", function () {
            state.sizeId = size.id;
            $$(".pd-size-btn", els.sizesEl).forEach(function (x) { x.classList.toggle("is-on", x === b); });
            updatePrice();
          });
          els.sizesEl.appendChild(b);
        });
      }
    }

    function setQty(n) {
      state.qty = Math.max(1, n);
      if (els.qtyOut) els.qtyOut.textContent = String(state.qty);
    }

    function handleAdd() {
      var v = variantFor(state.sizeId);
      var cart = window.VervainCart;
      if (!cart) return;
      cart.add({
        id: product.slug,
        size: v.id,
        sizeLabel: product.sizes.length > 1 ? v.label : "",
        name: product.name,
        price: v.price,
        qty: state.qty,
        img: product.images[0],
      });
      cart.notifyAdded(product.name, product.sizes.length > 1 ? v.label : "");
      setQty(1);
    }

    // The interactive controls are cloned-and-replaced before wiring, on every call.
    // That strips any listeners from a previous mount() on this same scope (a no-op
    // the first time), so calling mount() again for a different product -- exactly
    // what the quick-view modal does on each open -- never double-fires.
    ["qtyMinus", "qtyPlus", "addBtn", "stickyAddBtn"].forEach(function (key) {
      var el = els[key];
      if (!el) return;
      var clone = el.cloneNode(true);
      el.parentNode.replaceChild(clone, el);
      els[key] = clone;
    });

    if (els.qtyMinus) els.qtyMinus.addEventListener("click", function () { setQty(state.qty - 1); });
    if (els.qtyPlus) els.qtyPlus.addEventListener("click", function () { setQty(state.qty + 1); });
    if (els.addBtn) els.addBtn.addEventListener("click", handleAdd);
    if (els.stickyAddBtn) els.stickyAddBtn.addEventListener("click", handleAdd);

    updatePrice();
    setQty(1);
  }

  window.VervainProductView = { mount: mount, money: money };
})();
