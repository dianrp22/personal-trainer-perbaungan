// Scene 3D hero: dua trainer berjalan ke arah pengunjung di atas lintasan yang bergerak.
// Di-load lazy (dynamic import) supaya tidak memperlambat tampilan awal halaman.
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Human, FACE_SIZE, type FigureKind } from "./human";

const ACCENT = 0xff5a1f;
const RIM = 0xc6ff3d;
const BG = 0x0d0d0c;

export type CrewMember = { kind: FigureKind; face?: string };

/** Posisi layar (px, relatif ke container) untuk menempelkan balon kata & tombol. */
export type CrewPoint = { headX: number; headY: number; footX: number; footY: number };

export type CrewApi = {
  dispose(): void;
  setTalking(i: number, on: boolean): void;
  setFocus(i: number | null): void;
};

type Disposable = { dispose(): void };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export function mountCrewScene(
  container: HTMLElement,
  opts: { members: CrewMember[]; reducedMotion: boolean; onProject?: (pts: CrewPoint[]) => void }
): CrewApi {
  const { members, reducedMotion, onProject } = opts;
  const noop: CrewApi = { dispose() {}, setTalking() {}, setFocus() {} };

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  } catch {
    return noop; // WebGL tidak tersedia: hero tetap tampil tanpa 3D.
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  container.appendChild(renderer.domElement);

  const disposables: Disposable[] = [];
  const track = <T extends Disposable>(x: T): T => {
    disposables.push(x);
    return x;
  };

  // ---------- Scene, kamera, cahaya ----------
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(BG, 9, 19);
  const pmrem = track(new THREE.PMREMGenerator(renderer));
  scene.environment = track(pmrem.fromScene(new RoomEnvironment(), 0.04).texture);
  scene.environmentIntensity = 0.5;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  const camBase = new THREE.Vector3(0, 1.35, 7.2);
  const lookAt = new THREE.Vector3(0, 1.05, 0);
  camera.position.copy(camBase);

  scene.add(new THREE.HemisphereLight(0xc9d2cc, 0x0a0a09, 0.85));
  const key = new THREE.DirectionalLight(0xffffff, 1.7);
  key.position.set(-2.5, 5, 6);
  scene.add(key);
  const rimA = new THREE.PointLight(ACCENT, 45, 14, 2);
  rimA.position.set(2.6, 2.6, -2.2);
  scene.add(rimA);
  const rimB = new THREE.PointLight(RIM, 16, 14, 2);
  rimB.position.set(-2.6, 1.6, -2.2);
  scene.add(rimB);

  const stage = new THREE.Group();
  scene.add(stage);

  // ---------- Lintasan bergerak ----------
  const gridCanvas = document.createElement("canvas");
  gridCanvas.width = gridCanvas.height = 128;
  const gx = gridCanvas.getContext("2d")!;
  gx.strokeStyle = "rgba(255,90,31,0.55)";
  gx.lineWidth = 3;
  gx.beginPath();
  gx.moveTo(0, 1.5);
  gx.lineTo(128, 1.5);
  gx.stroke();
  gx.strokeStyle = "rgba(255,90,31,0.16)";
  gx.lineWidth = 2;
  gx.beginPath();
  gx.moveTo(1, 0);
  gx.lineTo(1, 128);
  gx.stroke();
  const gridTex = track(new THREE.CanvasTexture(gridCanvas));
  gridTex.wrapS = gridTex.wrapT = THREE.RepeatWrapping;
  gridTex.repeat.set(5, 10);
  gridTex.colorSpace = THREE.SRGBColorSpace;
  gridTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const ground = new THREE.Mesh(
    track(new THREE.PlaneGeometry(12, 24)),
    track(new THREE.MeshBasicMaterial({ map: gridTex, transparent: true, depthWrite: false }))
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.z = -4;
  stage.add(ground);

  // Cahaya di bawah kaki.
  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = glowCanvas.height = 128;
  const gg = glowCanvas.getContext("2d")!;
  const grad = gg.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,90,31,0.5)");
  grad.addColorStop(1, "rgba(255,90,31,0)");
  gg.fillStyle = grad;
  gg.fillRect(0, 0, 128, 128);
  const glowTex = track(new THREE.CanvasTexture(glowCanvas));
  const glowGeo = track(new THREE.PlaneGeometry(1.5, 1.5));
  const glowMat = track(
    new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
  );

  // Partikel debu yang mengalir ke belakang.
  const COUNT = 150;
  const pos = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 9;
    pos[i * 3 + 1] = 0.15 + Math.random() * 4;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 18 - 2;
  }
  const dustGeo = track(new THREE.BufferGeometry());
  dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  stage.add(
    new THREE.Points(
      dustGeo,
      track(new THREE.PointsMaterial({ color: ACCENT, size: 0.04, transparent: true, opacity: 0.55, depthWrite: false }))
    )
  );

  // ---------- Figur ----------
  const spacing = 1.25;
  const crew = members.map((mem, i) => {
    const h = new Human(mem.kind);
    const x = (i - (members.length - 1) / 2) * spacing;
    h.root.position.set(x, 0, i % 2 ? -0.25 : 0.1);
    stage.add(h.root);
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.set(x, 0.01, h.root.position.z);
    stage.add(glow);
    if (mem.face) {
      h.setFace(mem.face)
        .then(() => reducedMotion && renderStill())
        .catch(() => {}); // gagal muat: tetap kepala sementara
    }
    return { h, glow, phaseOffset: i * 2.2, talking: false, focus: false };
  });

  // ---------- Layout responsif ----------
  let W = 1;
  let H = 1;
  function layout() {
    W = container.clientWidth || 1;
    H = container.clientHeight || 1;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    const visibleW = 2 * camBase.z * Math.tan(THREE.MathUtils.degToRad(15)) * camera.aspect;
    if (camera.aspect < 0.9) {
      // HP (portrait): figur di bagian atas, teks di bawah.
      stage.position.set(0, 0.92, 0);
      stage.scale.setScalar(Math.min(0.78, visibleW / 3.2));
    } else {
      // Desktop: figur di kanan, judul di kiri.
      // Kaki berhenti di atas baris stopwatch/CTA supaya tombol WA tidak bertabrakan.
      stage.position.set(Math.min(2.2, visibleW * 0.26), 0.4, 0);
      stage.scale.setScalar(0.85);
    }
  }
  layout();

  // ---------- Interaksi ----------
  const pointer = { x: 0, y: 0, moved: false };
  const onPointer = (e: PointerEvent) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    pointer.moved = true;
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  // Scroll = berlari. Diam = jalan santai.
  let lastScrollY = window.scrollY;
  let lastScrollAt = 0;
  let scrollSpeed = 0;
  const onScroll = () => {
    const now = performance.now();
    const dt = Math.max(16, now - lastScrollAt);
    scrollSpeed = (Math.abs(window.scrollY - lastScrollY) / dt) * 1000;
    lastScrollY = window.scrollY;
    lastScrollAt = now;
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  // ---------- Wajah menghadap kamera + proyeksi titik layar ----------
  const qParent = new THREE.Quaternion();
  const qLook = new THREE.Quaternion();
  const eLook = new THREE.Euler();
  const v = new THREE.Vector3();
  const toScreen = (vec: THREE.Vector3) => {
    vec.project(camera);
    return [(vec.x * 0.5 + 0.5) * W, (-vec.y * 0.5 + 0.5) * H] as const;
  };

  function faces(dt: number, wobble: number) {
    const pts: CrewPoint[] = [];
    crew.forEach((c, i) => {
      const anchor = c.h.headAnchor;
      if (c.h.face) {
        anchor.parent!.getWorldQuaternion(qParent);
        anchor.quaternion.copy(qParent.invert()).multiply(camera.quaternion);
        eLook.set(pointer.y * 0.16, pointer.x * 0.28, wobble * (i % 2 ? -1 : 1));
        anchor.quaternion.multiply(qLook.setFromEuler(eLook));

        anchor.getWorldPosition(v).project(camera);
        const dx = (v.x - pointer.x) * camera.aspect;
        const dy = v.y + pointer.y;
        c.h.face.setSmile(c.focus || c.talking || (pointer.moved && Math.hypot(dx, dy) < 0.4) ? 1 : 0);
        c.h.face.setTalk(c.talking);
        c.h.face.update(dt);
      }
      anchor.getWorldPosition(v);
      v.y += (FACE_SIZE / 2) * stage.scale.y;
      const [hx, hy] = toScreen(v);
      c.h.root.getWorldPosition(v);
      const [fx, fy] = toScreen(v);
      pts.push({ headX: hx, headY: hy, footX: fx, footY: fy });
    });
    onProject?.(pts);
  }

  // ---------- Loop ----------
  const clock = new THREE.Clock();
  let phase = 0;
  let gait = 0;

  function frame() {
    // Hero sedang tertutup section lain (sticky stack): tidak perlu menggambar.
    if (container.closest(".is-covered")) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const scrolling = performance.now() - lastScrollAt < 160;
    const target = scrolling ? Math.min(1, Math.max(0.45, scrollSpeed / 1400)) : 0;
    gait += (target - gait) * Math.min(1, dt * (target > gait ? 4 : 1.2));
    phase += dt * mix(0.9, 1.45, gait) * Math.PI * 2;

    crew.forEach((c) => {
      c.h.pose(phase + c.phaseOffset, gait, dt);
      c.glow.scale.setScalar(1 - c.h.root.position.y * 1.5);
    });

    gridTex.offset.y -= dt * mix(0.2, 0.7, gait);
    const dustSpeed = mix(1.2, 5.5, gait);
    for (let i = 0; i < COUNT; i++) {
      let z = pos[i * 3 + 2] - dt * dustSpeed;
      if (z < -11) z += 18;
      pos[i * 3 + 2] = z;
    }
    dustGeo.attributes.position!.needsUpdate = true;

    stage.rotation.y += (pointer.x * 0.18 - stage.rotation.y) * 0.05;
    camera.position.x += (camBase.x + pointer.x * 0.45 - camera.position.x) * 0.05;
    camera.position.y += (camBase.y - pointer.y * 0.3 - camera.position.y) * 0.05;
    camera.lookAt(lookAt);
    faces(dt, Math.sin(phase * 2 + 0.8) * mix(0.03, 0.07, gait));
    renderer.render(scene, camera);
  }

  function renderStill() {
    crew.forEach((c) => c.h.pose(0.9 + c.phaseOffset, 0, 0));
    camera.lookAt(lookAt);
    faces(0, 0);
    renderer.render(scene, camera);
  }

  let visible = true;
  const updateLoop = () => {
    const run = !reducedMotion && visible && !document.hidden;
    if (run) clock.getDelta(); // hindari lompatan waktu setelah jeda
    renderer.setAnimationLoop(run ? frame : null);
  };
  const io = new IntersectionObserver(([entry]) => {
    visible = !!entry?.isIntersecting;
    updateLoop();
  });
  io.observe(container);
  document.addEventListener("visibilitychange", updateLoop);

  const ro = new ResizeObserver(() => {
    layout();
    if (reducedMotion) renderStill();
  });
  ro.observe(container);

  renderStill();
  container.classList.add("is-ready");
  updateLoop();

  return {
    setTalking(i, on) {
      if (crew[i]) crew[i].talking = on;
      if (reducedMotion) renderStill();
    },
    setFocus(i) {
      crew.forEach((c, k) => {
        c.focus = k === i;
        c.h.setWave(k === i);
      });
    },
    dispose() {
      renderer.setAnimationLoop(null);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", updateLoop);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      crew.forEach((c) => c.h.dispose());
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
      container.classList.remove("is-ready");
    },
  };
}
