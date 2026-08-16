/* Shop: category filter, cart, and a simulated checkout.
   Everything here is demo behaviour. No payment is taken and nothing leaves the browser;
   the cart is kept in localStorage so a refresh does not lose it. */
(function () {
  "use strict";

  var SHIPPING = 35;
  var FREE_FROM = 300;
  var STORE_KEY = "verbena-cart";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  var money = function (n) { return "₪" + n.toLocaleString("he-IL"); };

  // ---------- state ----------

  var cart = [];
  try {
    cart = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
    if (!Array.isArray(cart)) cart = [];
  } catch (e) { cart = []; }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(cart)); } catch (e) {}
  }

  function subtotal() {
    return cart.reduce(function (s, it) { return s + it.price * it.qty; }, 0);
  }
  function shipping() {
    var s = subtotal();
    return s === 0 || s >= FREE_FROM ? 0 : SHIPPING;
  }
  function count() {
    return cart.reduce(function (s, it) { return s + it.qty; }, 0);
  }

  // ---------- open / close helpers ----------
  // The panels start with [hidden] (display:none), so a transition only runs if the
  // element is painted first and the class lands on a later frame.

  var scrim = $("[data-scrim]");

  function show(el, cls) {
    el.hidden = false;
    requestAnimationFrame(function () { el.classList.add(cls); });
  }
  function hide(el, cls) {
    el.classList.remove(cls);
    var done = function () { el.hidden = true; };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return done();
    setTimeout(done, 350);
  }
  function lockScroll(on) {
    document.body.style.overflow = on ? "hidden" : "";
  }

  // ---------- cart drawer ----------

  var drawer = $("[data-cart]");
  var body = $("[data-cart-body]");
  var foot = $("[data-cart-foot]");
  var countEl = $("[data-cart-count]");
  var lastFocus = null;

  function openCart() {
    lastFocus = document.activeElement;
    render();
    show(scrim, "is-on");
    show(drawer, "is-on");
    lockScroll(true);
    var close = $("[data-close-cart]");
    if (close) close.focus();
  }

  function closeCart() {
    hide(drawer, "is-on");
    if (!isCheckoutOpen()) {
      hide(scrim, "is-on");
      lockScroll(false);
    }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function add(name, price, img) {
    var found = null;
    for (var i = 0; i < cart.length; i++) if (cart[i].name === name) found = cart[i];
    if (found) found.qty += 1;
    else cart.push({ name: name, price: price, img: img, qty: 1 });
    save();
    render();
    toast(name + " נוסף לסל");
  }

  function setQty(name, delta) {
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].name !== name) continue;
      cart[i].qty += delta;
      if (cart[i].qty < 1) cart.splice(i, 1);
      break;
    }
    save();
    render();
  }

  function remove(name) {
    cart = cart.filter(function (it) { return it.name !== name; });
    save();
    render();
  }

  function render() {
    var n = count();
    countEl.textContent = String(n);
    countEl.hidden = n === 0;

    if (!cart.length) {
      body.innerHTML = '<p class="cart-empty">הסל ריק. אפשר להתחיל מהחנות.</p>';
      foot.hidden = true;
      renderSummary();
      return;
    }

    body.innerHTML = "";
    cart.forEach(function (it) {
      var row = document.createElement("div");
      row.className = "cart-item";

      var img = document.createElement("img");
      img.src = it.img;
      img.alt = "";
      img.loading = "lazy";
      row.appendChild(img);

      var col = document.createElement("div");

      var name = document.createElement("div");
      name.className = "cart-item-name";
      name.textContent = it.name;
      col.appendChild(name);

      var price = document.createElement("div");
      price.className = "cart-item-price";
      price.textContent = money(it.price) + " ליחידה";
      col.appendChild(price);

      var qty = document.createElement("div");
      qty.className = "qty";

      var minus = document.createElement("button");
      minus.type = "button";
      minus.setAttribute("aria-label", "הפחתת כמות של " + it.name);
      minus.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-minus" /></svg>';
      minus.addEventListener("click", function () { setQty(it.name, -1); });

      var out = document.createElement("output");
      out.textContent = String(it.qty);

      var plus = document.createElement("button");
      plus.type = "button";
      plus.setAttribute("aria-label", "הוספת כמות של " + it.name);
      plus.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-plus" /></svg>';
      plus.addEventListener("click", function () { setQty(it.name, 1); });

      var rm = document.createElement("button");
      rm.type = "button";
      rm.className = "rm";
      rm.setAttribute("aria-label", "הסרת " + it.name + " מהסל");
      rm.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-trash" /></svg>';
      rm.addEventListener("click", function () { remove(it.name); });

      qty.appendChild(minus);
      qty.appendChild(out);
      qty.appendChild(plus);
      qty.appendChild(rm);
      col.appendChild(qty);

      row.appendChild(col);
      body.appendChild(row);
    });

    foot.hidden = false;
    $("[data-subtotal]").textContent = money(subtotal());
    $("[data-shipping]").textContent = shipping() === 0 ? "חינם" : money(shipping());
    $("[data-total]").textContent = money(subtotal() + shipping());

    var hint = $("[data-free-hint]");
    var gap = FREE_FROM - subtotal();
    hint.textContent = gap > 0 ? "עוד " + money(gap) + " ומשלוח חינם" : "";

    renderSummary();
  }

  // ---------- checkout ----------

  var view = $("[data-checkout-view]");
  var formWrap = $("[data-checkout-form]");
  var doneWrap = $("[data-checkout-done]");
  var form = $(".checkout-form");

  function isCheckoutOpen() { return view && !view.hidden; }

  function renderSummary() {
    var box = $("[data-summary]");
    if (!box) return;
    box.innerHTML = "";
    cart.forEach(function (it) {
      var row = document.createElement("div");
      row.className = "sum-item";
      var left = document.createElement("span");
      left.textContent = it.name + (it.qty > 1 ? " ×" + it.qty : "");
      var right = document.createElement("span");
      right.textContent = money(it.price * it.qty);
      row.appendChild(left);
      row.appendChild(right);
      box.appendChild(row);
    });
    $("[data-co-subtotal]").textContent = money(subtotal());
    $("[data-co-shipping]").textContent = shipping() === 0 ? "חינם" : money(shipping());
    $("[data-co-total]").textContent = money(subtotal() + shipping());
  }

  function openCheckout() {
    if (!cart.length) return;
    renderSummary();
    formWrap.hidden = false;
    doneWrap.hidden = true;
    hide(drawer, "is-on");
    show(scrim, "is-on");
    view.hidden = false;
    lockScroll(true);
    var first = $("#co-name");
    if (first) first.focus();
  }

  function closeCheckout() {
    view.hidden = true;
    hide(scrim, "is-on");
    lockScroll(false);
  }

  function validate() {
    var ok = true;
    $$(".field", form).forEach(function (field) {
      var input = $("input, select, textarea", field);
      var err = $("[data-err]", field);
      if (!input || !input.required) return;
      var value = (input.value || "").trim();
      var message = "";

      if (!value) message = "שדה חובה";
      else if (input.type === "tel" && !/^0\d{1,2}-?\d{7}$/.test(value.replace(/\s/g, "")))
        message = "מספר טלפון לא תקין";
      else if (input.type === "date" && new Date(value) < new Date(new Date().toDateString()))
        message = "תאריך שכבר עבר";

      field.classList.toggle("invalid", !!message);
      if (err) err.textContent = message;
      if (message && ok) { input.focus(); ok = false; }
    });
    return ok;
  }

  function placeOrder() {
    if (!validate()) return;
    var no = "VB-" + String(Math.floor(10000 + Math.random() * 89999));
    $("[data-order-no]").textContent = no;
    formWrap.hidden = true;
    doneWrap.hidden = false;
    cart = [];
    save();
    render();
    view.scrollTop = 0;
  }

  // ---------- toast ----------

  var toastEl = $("[data-toast]");
  var toastTimer = 0;
  function toast(text) {
    if (!toastEl) return;
    // The open drawer already shows the item landing in the cart, and on a phone the
    // toast would sit on top of the checkout button.
    if (drawer && !drawer.hidden) return;
    toastEl.textContent = text;
    toastEl.hidden = false;
    requestAnimationFrame(function () { toastEl.classList.add("is-on"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
      setTimeout(function () { toastEl.hidden = true; }, 250);
    }, 2200);
  }

  // ---------- filters ----------

  function applyFilter(cat) {
    var shown = 0;
    $$("[data-cat]").forEach(function (card) {
      var on = cat === "all" || card.getAttribute("data-cat") === cat;
      card.hidden = !on;
      if (on) shown++;
    });
    $$("[data-filter]").forEach(function (chip) {
      chip.classList.toggle("is-on", chip.getAttribute("data-filter") === cat);
    });
    var empty = $("[data-empty]");
    if (empty) empty.hidden = shown > 0;
  }

  // ---------- wiring ----------

  document.addEventListener("click", function (e) {
    var addBtn = e.target.closest("[data-add]");
    if (addBtn) {
      add(addBtn.dataset.name, Number(addBtn.dataset.price), addBtn.dataset.img);
      return;
    }

    var chip = e.target.closest("[data-filter]");
    if (chip) { applyFilter(chip.getAttribute("data-filter")); return; }

    var jump = e.target.closest("[data-jump]");
    if (jump) { applyFilter(jump.getAttribute("data-jump")); return; }

    if (e.target.closest("[data-open-cart]")) { openCart(); return; }
    if (e.target.closest("[data-close-cart]")) { closeCart(); return; }
    if (e.target.closest("[data-checkout]")) { openCheckout(); return; }
    if (e.target.closest("[data-close-checkout]")) { closeCheckout(); return; }
    if (e.target.closest("[data-place-order]")) { placeOrder(); return; }
    if (e.target.closest("[data-back-to-cart]")) { closeCheckout(); openCart(); return; }

    if (e.target === scrim) {
      if (isCheckoutOpen()) closeCheckout();
      else closeCart();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (isCheckoutOpen()) closeCheckout();
    else if (drawer && !drawer.hidden) closeCart();
  });

  // Delivery cannot be in the past, and same-day orders close at 14:00
  var dateInput = $("#co-date");
  if (dateInput) {
    var d = new Date();
    if (d.getHours() >= 14) d.setDate(d.getDate() + 1);
    var iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    dateInput.min = iso;
    dateInput.value = iso;
  }

  render();
})();
