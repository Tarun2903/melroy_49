/**
 * Melroy — 5-Day AI Digital Product Challenge
 * Site behaviour: payment links, mobile nav, sticky buy bar,
 * scroll-reveal animations, animated counters.
 */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ===== CONFIG — swap this with your real Razorpay payment link ===== */
  var PAYMENT_LINK = "https://rzp.io/l/YOUR-PAYMENT-LINK";

  document.querySelectorAll(".cta").forEach(function (a) {
    a.href = PAYMENT_LINK;
  });

  /* Footer year */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ===== Order bump add-ons: live total (display only) =====
     NOTE: this updates the on-page price/label for UX only. The CTA still
     points at the static PAYMENT_LINK above — passing the selected total
     through to an actual charge requires the Razorpay integration pass. */
  var addonChecks = document.querySelectorAll(".addon-check");
  var totalEl = document.querySelector(".total-amount");
  var includedCtaLabel = document.getElementById("includedCtaLabel");
  var includedTotal = document.getElementById("includedTotal");
  if (addonChecks.length && totalEl && includedCtaLabel && includedTotal) {
    var basePrice = parseFloat(includedTotal.getAttribute("data-base")) || 0;
    var updateTotal = function () {
      var total = basePrice;
      addonChecks.forEach(function (c) {
        if (c.checked) total += parseFloat(c.getAttribute("data-price")) || 0;
      });
      totalEl.textContent = "₹" + total;
      includedCtaLabel.textContent = "Get Everything for ₹" + total;
    };
    addonChecks.forEach(function (c) {
      c.addEventListener("change", updateTotal);
    });
  }

  /* ===== Mobile navigation menu ===== */
  var navToggle = document.getElementById("navToggle");
  var navlinks = document.getElementById("navlinks");
  if (navToggle && navlinks) {
    var closeMenu = function () {
      navlinks.classList.remove("open");
      navToggle.classList.remove("is-active");
      navToggle.setAttribute("aria-expanded", "false");
    };
    navToggle.addEventListener("click", function () {
      var isOpen = navlinks.classList.toggle("open");
      navToggle.classList.toggle("is-active", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    navlinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navlinks.classList.contains("open")) {
        closeMenu();
        navToggle.focus();
      }
    });
  }

  /* Sticky buy bar appears after scrolling past the hero */
  var bar = document.getElementById("buybar");
  var hero = document.querySelector(".hero");
  if (bar && hero && "IntersectionObserver" in window) {
    new IntersectionObserver(
      function (entries) {
        var e = entries[0];
        bar.classList.toggle("show", !e.isIntersecting);
        bar.setAttribute("aria-hidden", String(e.isIntersecting));
      },
      { threshold: 0 }
    ).observe(hero);
  }

  /* ===== Animated counters (e.g. 4.9 rating, 100% guarantee) ===== */
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-target"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (isNaN(target)) return;

    if (reduceMotion) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }

    var duration = 1200;
    var start = null;

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); /* ease-out cubic */
      var value = target * eased;
      el.textContent = value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll(".counter");
  if (counters.length) {
    if ("IntersectionObserver" in window) {
      var counterObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach(function (el) {
        counterObserver.observe(el);
      });
    } else {
      counters.forEach(animateCounter);
    }
  }

  /* ===== Scroll-reveal animations ===== */
  if (reduceMotion || !("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal, .reveal-group").forEach(function (el) {
      el.classList.add("in-view");
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;

          if (el.classList.contains("reveal-group")) {
            Array.prototype.forEach.call(el.children, function (child, i) {
              child.style.transitionDelay = i * 70 + "ms";
            });
          }

          el.classList.add("in-view");
          obs.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".reveal, .reveal-group").forEach(function (el) {
      revealObserver.observe(el);
    });
  }
})();
