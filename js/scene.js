/* ============================================================
   LAUNCH LINE — 3D Symbol Scene (Three.js, ES module)
   Thin chrome line-art mark (ring + double "L"), bloom glow,
   studio environment reflections, discreet particles.
   ============================================================ */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

(function () {
  var canvas = document.getElementById("webgl-canvas");
  if (!canvas) return;

  var isMobile = window.matchMedia("(max-width: 768px)").matches;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.045);

  var pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  var camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 6.4);

  /* ---------------- lights ---------------- */
  scene.add(new THREE.AmbientLight(0x30323a, 0.5));

  var key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(3, 4, 5);
  scene.add(key);

  var rim = new THREE.PointLight(0x5eb3ff, isMobile ? 1.5 : 2.5, 20, 2);
  rim.position.set(-3, 1.5, -2);
  scene.add(rim);

  var rim2 = new THREE.PointLight(0xffffff, isMobile ? 1.2 : 2, 20, 2);
  rim2.position.set(2.5, -1.5, 2.5);
  scene.add(rim2);

  /* ---------------- symbol geometry (thin chrome line-art) ---------------- */
  var SCALE = 0.018;
  var TUBE_R = 3.1;

  var chromeMat = new THREE.MeshPhysicalMaterial({
    color: 0xc6c6cc,
    metalness: 1,
    roughness: 0.32,
    clearcoat: 0.6,
    clearcoatRoughness: 0.25,
    envMapIntensity: 0.9
  });

  var sparkMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  var symbolGroup = new THREE.Group();
  var innerGroup = new THREE.Group();

  // ring: open arc, gap at bottom, sampled + smoothed into a tube
  var ringCenter = new THREE.Vector2(0, 0);
  var ringR = 78;
  var startDeg = -55, endDeg = 235;
  var ringPts = [];
  var SEG = 72;
  for (var i = 0; i <= SEG; i++) {
    var t = i / SEG;
    var ang = THREE.MathUtils.degToRad(startDeg + (endDeg - startDeg) * t);
    ringPts.push(new THREE.Vector3(
      ringCenter.x + ringR * Math.cos(ang),
      ringCenter.y + ringR * Math.sin(ang),
      0
    ));
  }
  var ringCurve = new THREE.CatmullRomCurve3(ringPts);
  var ringGeo = new THREE.TubeGeometry(ringCurve, 120, TUBE_R, 14, false);
  var ringMesh = new THREE.Mesh(ringGeo, chromeMat);
  innerGroup.add(ringMesh);

  function cylBetween(a, b, radius) {
    var dir = new THREE.Vector3().subVectors(b, a);
    var len = dir.length();
    var geo = new THREE.CylinderGeometry(radius, radius, len, 12);
    var mesh = new THREE.Mesh(geo, chromeMat);
    mesh.position.addVectors(a, b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return mesh;
  }

  function jointSphere(p, radius) {
    var mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 14, 14), chromeMat);
    mesh.position.copy(p);
    return mesh;
  }

  function buildL(p1, p2, p3) {
    var g = new THREE.Group();
    g.add(cylBetween(p1, p2, TUBE_R));
    g.add(cylBetween(p2, p3, TUBE_R));
    g.add(jointSphere(p2, TUBE_R * 0.96));
    return g;
  }

  var L1 = buildL(
    new THREE.Vector3(-28, 52, 0),
    new THREE.Vector3(-28, -36, 0),
    new THREE.Vector3(22, -36, 0)
  );
  var L2 = buildL(
    new THREE.Vector3(0, 26, 0),
    new THREE.Vector3(0, -62, 0),
    new THREE.Vector3(50, -62, 0)
  );
  innerGroup.add(L1, L2);

  // spark highlights (bloom picks these up)
  [
    new THREE.Vector3(-44.74, -63.9, 2),
    new THREE.Vector3(44.74, -63.9, 2),
    new THREE.Vector3(0, 78, 2)
  ].forEach(function (p) {
    var s = new THREE.Mesh(new THREE.SphereGeometry(2.4, 10, 10), sparkMat);
    s.position.copy(p);
    innerGroup.add(s);
  });

  innerGroup.position.set(0, -2, 0);
  symbolGroup.add(innerGroup);
  symbolGroup.scale.set(SCALE, SCALE, SCALE);
  symbolGroup.rotation.x = 0.08;
  symbolGroup.visible = false;
  scene.add(symbolGroup);

  /* ---------------- particles ---------------- */
  var count = isMobile ? 160 : 650;
  var geo = new THREE.BufferGeometry();
  var positions = new Float32Array(count * 3);
  for (var pi = 0; pi < count; pi++) {
    var r = 4 + Math.random() * 7;
    var theta = Math.random() * Math.PI * 2;
    var phi = Math.acos((Math.random() * 2) - 1);
    positions[pi * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[pi * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
    positions[pi * 3 + 2] = r * Math.cos(phi) * 0.6 - 2;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  var particleMat = new THREE.PointsMaterial({
    color: 0xdfe6ee,
    size: isMobile ? 0.018 : 0.022,
    transparent: true,
    opacity: 0.4,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  var particles = new THREE.Points(geo, particleMat);
  scene.add(particles);

  /* ---------------- bloom post-processing ---------------- */
  var composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  var bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    isMobile ? 0.22 : 0.32,
    0.35,
    0.86
  );
  composer.addPass(bloomPass);

  /* ---------------- interaction state ---------------- */
  var mouse = { x: 0, y: 0 };
  var targetRot = { x: 0.08, y: 0 };
  window.addEventListener("pointermove", function (e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  window.addEventListener("resize", function () {
    var w = window.innerWidth, h = window.innerHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
  });

  /* ---------------- scroll-tied placement ---------------- */
  var stops = [
    { p: 0.00, x: 1.7,  y: -0.1, z: -0.6, s: 0.58, op: 0.42 },
    { p: 0.09, x: 2.35, y: 0.35, z: -1.9, s: 0.30, op: 0.14 },
    { p: 0.80, x: 2.35, y: 0.35, z: -1.9, s: 0.30, op: 0.14 },
    { p: 0.85, x: 0.0,  y: 0.0,  z: 0,    s: 0.85, op: 0.5 },
    { p: 0.90, x: 0.0,  y: -0.1, z: 0,    s: 0.7,  op: 0.26 },
    { p: 1.00, x: 1.8,  y: 0.2,  z: -1.5, s: 0.35, op: 0.12 }
  ];

  function sample(p) {
    for (var i = 0; i < stops.length - 1; i++) {
      var a = stops[i], b = stops[i + 1];
      if (p >= a.p && p <= b.p) {
        var t = (b.p - a.p) === 0 ? 0 : (p - a.p) / (b.p - a.p);
        return {
          x: a.x + (b.x - a.x) * t,
          y: a.y + (b.y - a.y) * t,
          z: a.z + (b.z - a.z) * t,
          s: a.s + (b.s - a.s) * t,
          op: a.op + (b.op - a.op) * t
        };
      }
    }
    return stops[stops.length - 1];
  }

  var scrollTarget = sample(0);
  window.__llScene = {
    setProgress: function (p) { scrollTarget = sample(p); },
    reveal: function () { symbolGroup.visible = true; }
  };

  if (window.__llIntroDone) symbolGroup.visible = true;
  document.addEventListener("ll:intro-done", function () { symbolGroup.visible = true; });

  if (window.ScrollTrigger && window.gsap) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
      onUpdate: function (self) { window.__llScene.setProgress(self.progress); }
    });
  }

  /* ---------------- render loop ---------------- */
  var clock = new THREE.Clock();
  var curPos = new THREE.Vector3(1.7, -0.1, -0.6);
  var curScale = 0.58;
  var curOp = 0.42;

  function animate() {
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();

    if (symbolGroup.visible) {
      targetRot.y = mouse.x * 0.22;
      targetRot.x = 0.08 - mouse.y * 0.12;
      symbolGroup.rotation.y += (targetRot.y - symbolGroup.rotation.y) * 0.04;
      symbolGroup.rotation.x += (targetRot.x - symbolGroup.rotation.x) * 0.04;
      if (!reduceMotion) symbolGroup.rotation.z = Math.sin(t * 0.15) * 0.03;

      curPos.x += (scrollTarget.x - curPos.x) * 0.06;
      curPos.y += (scrollTarget.y - curPos.y) * 0.06;
      curPos.z += (scrollTarget.z - curPos.z) * 0.06;
      curScale += (scrollTarget.s - curScale) * 0.06;
      curOp += (scrollTarget.op - curOp) * 0.06;

      symbolGroup.position.set(curPos.x, curPos.y + Math.sin(t * 0.4) * 0.04, curPos.z);
      symbolGroup.scale.setScalar(SCALE * curScale);
      chromeMat.opacity = 1;
      var visStrength = Math.min(1, curOp / 0.5);
      bloomPass.strength = (isMobile ? 0.22 : 0.32) * (0.6 + visStrength * 0.6);
    }

    if (!reduceMotion) particles.rotation.y = t * 0.012;
    particleMat.opacity = 0.32 + Math.sin(t * 0.2) * 0.06;

    composer.render();
  }
  animate();
})();
