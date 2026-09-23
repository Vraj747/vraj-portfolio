import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const canvas = document.getElementById("bg-canvas");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function supportsWebGL() {
  try {
    const testCanvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
}

if (!canvas || !supportsWebGL()) {
  document.body.classList.add("no-webgl");
} else {
  initScene();
}

function initScene() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0a0b0f, 12, 58);
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0, 8);

  const ambient = new THREE.AmbientLight(0x6a6f80, 1.1);
  scene.add(ambient);

  const keyLight = new THREE.PointLight(0x7c5cff, 12, 60);
  keyLight.position.set(6, 6, 10);
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(0x22d3ee, 10, 60);
  rimLight.position.set(-8, -4, -10);
  scene.add(rimLight);

  // Starfield
  const starCount = 1400;
  const starGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 120;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 120 - 20;
  }
  starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const starMaterial = new THREE.PointsMaterial({ color: 0x9aa0b5, size: 0.09, transparent: true, opacity: 0.7 });
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  // Milestone shapes, one per journey section, spaced along Z
  const shapeConfigs = [
    { geo: new THREE.IcosahedronGeometry(1.1, 0), color: 0x7c5cff, z: -2, x: 3.4, y: 0.6 },
    { geo: new THREE.TorusGeometry(0.9, 0.28, 24, 80), color: 0x22d3ee, z: -17, x: -3.6, y: -0.4 },
    { geo: new THREE.OctahedronGeometry(1, 0), color: 0x7c5cff, z: -32, x: 3.2, y: 0.8 },
    { geo: new THREE.TorusKnotGeometry(0.7, 0.22, 100, 16), color: 0x22d3ee, z: -47, x: -3, y: -0.5 },
  ];

  const shapes = shapeConfigs.map((cfg) => {
    const material = new THREE.MeshStandardMaterial({
      color: cfg.color,
      metalness: 0.35,
      roughness: 0.25,
      emissive: cfg.color,
      emissiveIntensity: 0.18,
    });
    const mesh = new THREE.Mesh(cfg.geo, material);
    mesh.position.set(cfg.x, cfg.y, cfg.z);
    scene.add(mesh);
    return mesh;
  });

  function getScrollProgress() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    return scrollable > 0 ? window.scrollY / scrollable : 0;
  }

  const cameraZStart = 8;
  const cameraZEnd = -46;

  function onScroll() {
    const progress = getScrollProgress();
    camera.position.z = THREE.MathUtils.lerp(cameraZStart, cameraZEnd, progress);
    camera.position.x = Math.sin(progress * Math.PI * 2) * 0.6;
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener("resize", onResize);

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (!prefersReducedMotion) {
      shapes.forEach((mesh, i) => {
        mesh.rotation.x += delta * (0.15 + i * 0.05);
        mesh.rotation.y += delta * (0.2 + i * 0.04);
      });
      stars.rotation.y += delta * 0.01;
    }

    renderer.render(scene, camera);
  }

  animate();
}

// Panel reveal on scroll, independent of WebGL availability
const panels = document.querySelectorAll(".journey__panel");
if (panels.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.3 }
  );
  panels.forEach((panel) => observer.observe(panel));
}

// Progress rail: highlight the link for whichever panel is currently in view
const railLinks = document.querySelectorAll(".journey-rail a");
if (railLinks.length && panels.length) {
  const railObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const link = document.querySelector(`.journey-rail a[data-panel="${entry.target.dataset.panel}"]`);
        if (!link) return;
        railLinks.forEach((l) => l.classList.remove("is-active"));
        link.classList.add("is-active");
      });
    },
    { threshold: 0.5 }
  );
  panels.forEach((panel) => railObserver.observe(panel));
}
