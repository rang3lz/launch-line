/* ============================================================
   LAUNCH LINE — Site behaviour
   Scroll line, reveals, method track, connection, form.
   ============================================================ */
(function () {
  "use strict";

  var hasGsap = !!window.gsap && !!window.ScrollTrigger;
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------------- nav ---------------- */
  var nav = document.querySelector(".site-nav");
  var navToggle = document.querySelector(".nav-toggle");
  var navLinks = document.querySelector(".nav-links");

  window.addEventListener("scroll", function () {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 30);
  }, { passive: true });

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      navToggle.textContent = open ? "✕" : "☰";
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("open");
        navToggle.textContent = "☰";
      });
    });
  }

  /* ---------------- scroll connecting line ---------------- */
  var lineLayer = document.getElementById("scroll-line-layer");
  var scrollPath = document.getElementById("scroll-path");

  function sizeLineLayer() {
    if (!lineLayer) return;
    var footer = document.querySelector("footer");
    var end = footer ? footer.getBoundingClientRect().bottom + window.scrollY : document.body.scrollHeight;
    lineLayer.style.height = Math.ceil(end) + "px";
  }

  if (scrollPath) {
    var pathLen = scrollPath.getTotalLength();
    scrollPath.style.strokeDasharray = pathLen;
    scrollPath.style.strokeDashoffset = pathLen;
    sizeLineLayer();
    window.addEventListener("resize", sizeLineLayer);

    if (hasGsap) {
      ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.4,
        onUpdate: function (self) {
          scrollPath.style.strokeDashoffset = pathLen * (1 - self.progress);
        }
      });
    } else {
      window.addEventListener("scroll", function () {
        var p = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        scrollPath.style.strokeDashoffset = pathLen * (1 - Math.min(1, Math.max(0, p)));
      });
    }
  }

  /* ---------------- generic reveals ---------------- */
  if (hasGsap) {
    ScrollTrigger.batch(".reveal", {
      start: "top 88%",
      onEnter: function (batch) {
        gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08 });
      }
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.style.opacity = 1; el.style.transform = "none"; });
  }

  document.addEventListener("ll:intro-done", function () {
    if (hasGsap) {
      gsap.to(".hero .reveal", { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.12, delay: 0.1 });
    } else {
      document.querySelectorAll(".hero .reveal").forEach(function (el) { el.style.opacity = 1; el.style.transform = "none"; });
    }
    sizeLineLayer();
    ScrollTrigger && ScrollTrigger.refresh();
  });

  /* ---------------- problem chain ---------------- */
  var chainSteps = document.querySelectorAll("#problem-chain [data-step]");
  var chainArrows = document.querySelectorAll("#problem-chain [data-arrow]");
  function updateChain(p) {
    var n = chainSteps.length;
    chainSteps.forEach(function (el, i) { el.classList.toggle("active", p >= i / n); });
    chainArrows.forEach(function (el, i) { el.classList.toggle("filled", p >= (i + 1) / n); });
  }
  if (hasGsap && chainSteps.length) {
    ScrollTrigger.create({
      trigger: "#problema",
      start: "top 65%",
      end: "bottom 45%",
      scrub: true,
      onUpdate: function (self) { updateChain(self.progress); }
    });
  }

  /* ---------------- method track ---------------- */
  var methodTrack = document.getElementById("method-track");
  var methodSteps = document.querySelectorAll("#method-track [data-method]");
  var methodProgress = document.getElementById("method-progress");
  if (hasGsap && methodSteps.length) {
    ScrollTrigger.create({
      trigger: "#metodo",
      start: "top 60%",
      end: "bottom 35%",
      scrub: true,
      onUpdate: function (self) {
        var p = self.progress;
        if (methodProgress) methodProgress.style.width = (p * 100) + "%";
        var idx = Math.min(methodSteps.length - 1, Math.floor(p * methodSteps.length));
        methodSteps.forEach(function (el, i) { el.classList.toggle("active", i === idx); });
        if (methodTrack && methodTrack.scrollWidth > methodTrack.clientWidth) {
          methodTrack.scrollLeft = p * (methodTrack.scrollWidth - methodTrack.clientWidth);
        }
      }
    });
  } else if (methodSteps.length) {
    methodSteps[0].classList.add("active");
  }

  /* ---------------- diferencial fragmentation ---------------- */
  var diffTool = document.getElementById("diff-tool");
  if (diffTool) {
    var text = diffTool.textContent;
    diffTool.textContent = "";
    var letters = text.split("").map(function (ch) {
      var span = document.createElement("span");
      span.textContent = ch === " " ? " " : ch;
      span.style.display = "inline-block";
      diffTool.appendChild(span);
      return span;
    });
    if (hasGsap) {
      ScrollTrigger.create({
        trigger: diffTool,
        start: "top 75%",
        once: true,
        onEnter: function () {
          letters.forEach(function (span) {
            gsap.fromTo(span, {
              x: (Math.random() - 0.5) * 60,
              y: (Math.random() - 0.5) * 40,
              rotate: (Math.random() - 0.5) * 40,
              opacity: 0.15
            }, {
              x: 0, y: 0, rotate: 0, opacity: 1,
              duration: 0.9,
              ease: "power3.out",
              delay: Math.random() * 0.25
            });
          });
        }
      });
    }
  }

  /* ---------------- connection section ---------------- */
  var connectNodes = document.querySelectorAll("#connect-wrap [data-node]");
  var connectCenter = document.getElementById("connect-center");
  if (hasGsap && connectNodes.length) {
    ScrollTrigger.create({
      trigger: "#connect-wrap",
      start: "top 60%",
      once: true,
      onEnter: function () {
        connectNodes.forEach(function (el, i) {
          gsap.delayedCall(i * 0.18, function () { el.classList.add("on"); });
        });
        gsap.delayedCall(connectNodes.length * 0.18 + 0.25, function () {
          if (connectCenter) connectCenter.classList.add("on");
        });
      }
    });
  }

  /* ---------------- contact form ---------------- */
  var form = document.getElementById("contact-form");
  var success = document.getElementById("form-success");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      form.classList.remove("open");
      if (success) success.classList.add("open");
    });
  }

  window.addEventListener("load", function () {
    sizeLineLayer();
    if (hasGsap) ScrollTrigger.refresh();
  });
})();
