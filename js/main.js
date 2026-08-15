/* Scroll reveals via IntersectionObserver. No scroll listeners, honors reduced motion. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = document.querySelectorAll(".reveal");

  /* Hold the hero video on its first frame under reduced motion */
  var heroVideo = document.querySelector(".hero-video");
  if (heroVideo && reduce) {
    heroVideo.removeAttribute("autoplay");
    heroVideo.removeAttribute("loop");
    heroVideo.pause();
  }

  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.15 }
  );

  items.forEach(function (el) { io.observe(el); });
})();

/* Bouquet unfolding: scroll-scrubbed frame sequence on a sticky canvas.
   Progress is read once per animation frame while the section is near the
   viewport (gated by IntersectionObserver); no scroll listeners. */
(function () {
  "use strict";

  var section = document.querySelector(".unfold");
  var canvas = document.querySelector(".unfold-canvas");
  if (!section || !canvas || !canvas.getContext) return;

  var ctx = canvas.getContext("2d");
  var FRAME_COUNT = 120;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function frameSrc(i) {
    if (window.__ZER_FRAMES__) return window.__ZER_FRAMES__[i];
    return "assets/zer-frames/frame-" + String(i).padStart(3, "0") + ".jpg";
  }

  var frames = new Array(FRAME_COUNT);
  var current = -1;

  function draw(value) {
    var i = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(value)));
    if (i === current) return;
    var img = frames[i];
    if (!img || !img.complete || !img.naturalWidth) return;
    current = i;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  /* Reduced motion: load and show only the fully open bouquet, no scrub */
  if (reduce) {
    var still = new Image();
    still.onload = function () {
      frames[FRAME_COUNT - 1] = still;
      draw(FRAME_COUNT - 1);
    };
    still.src = frameSrc(FRAME_COUNT - 1);
    return;
  }

  var loaded = false;
  function load() {
    if (loaded) return;
    loaded = true;
    for (var i = 0; i < FRAME_COUNT; i++) {
      var img = new Image();
      if (i === 0) {
        img.onload = function () { draw(0); };
      }
      img.src = frameSrc(i);
      frames[i] = img;
    }
  }

  var shown = 0;
  var running = false;
  var rafId = 0;

  function progress() {
    var rect = section.getBoundingClientRect();
    var runway = rect.height - window.innerHeight;
    if (runway <= 0) return 0;
    return Math.max(0, Math.min(1, -rect.top / runway));
  }

  function tick() {
    var target = progress() * (FRAME_COUNT - 1);
    shown += (target - shown) * 0.2;
    if (Math.abs(target - shown) < 0.4) shown = target;
    draw(shown);
    if (running) rafId = requestAnimationFrame(tick);
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          load();
          if (!running) {
            running = true;
            rafId = requestAnimationFrame(tick);
          }
        } else if (running) {
          running = false;
          cancelAnimationFrame(rafId);
        }
      });
    },
    { rootMargin: "60% 0px 60% 0px" }
  );
  io.observe(section);
})();
