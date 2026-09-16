/* ============================================================
   LAUNCH LINE — Cinematic Intro
   A linha desenha o símbolo. Rápido o suficiente para não
   prejudicar conversão; pulado em revisitas na mesma sessão.
   ============================================================ */
(function () {
  "use strict";

  var introEl = document.getElementById("intro");
  var skipBtn = document.getElementById("intro-skip");
  var played = false;
  try { played = sessionStorage.getItem("llIntroPlayed") === "1"; } catch (e) {}

  function revealMain() {
    window.__llIntroDone = true;
    if (window.__llScene) window.__llScene.reveal();
    document.dispatchEvent(new CustomEvent("ll:intro-done"));
    try { sessionStorage.setItem("llIntroPlayed", "1"); } catch (e) {}
  }

  if (!introEl) { revealMain(); return; }

  if (played || !window.gsap) {
    introEl.style.display = "none";
    revealMain();
    return;
  }

  var drawIds = ["draw-ring", "draw-l1", "draw-l2"];

  drawIds.forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    var len = el.getTotalLength();
    el.style.strokeDasharray = len;
    el.style.strokeDashoffset = len;
  });

  gsap.set(".intro-word", { opacity: 0, y: 14 });
  gsap.set(".intro-tag", { opacity: 0 });
  gsap.set("#intro-fill", { opacity: 0 });

  var tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

  tl.to("#draw-ring", { strokeDashoffset: 0, duration: 1.05 }, 0)
    .to("#draw-l1", { strokeDashoffset: 0, duration: 0.42 }, 0.75)
    .to("#draw-l2", { strokeDashoffset: 0, duration: 0.42 }, 1.0)
    .to("#intro-fill", { opacity: 1, duration: 0.5 }, 1.35)
    .to(drawIds.map(function (id) { return "#" + id; }), { opacity: 0, duration: 0.4 }, 1.4)
    .to(".intro-word", { opacity: 1, y: 0, duration: 0.55 }, 1.55)
    .to(".intro-tag", { opacity: 1, duration: 0.45 }, 1.85)
    .to({}, { duration: 0.35 })
    .call(revealMain)
    .to("#intro", { opacity: 0, duration: 0.65, ease: "power2.inOut" })
    .set("#intro", { display: "none" });

  gsap.to(skipBtn, { opacity: 1, duration: 0.4, delay: 0.4 });

  function skip() {
    tl.kill();
    gsap.to("#intro", {
      opacity: 0, duration: 0.4, onComplete: function () {
        introEl.style.display = "none";
        revealMain();
      }
    });
  }

  if (skipBtn) skipBtn.addEventListener("click", skip);
})();
