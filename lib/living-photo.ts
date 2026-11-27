// "Foto hidup": foto asli trainer di dalam kartu yang berkedip, tersenyum, bicara,
// bernapas, dan punya efek kedalaman mengikuti kursor. Di-load lazy (three.js).
import * as THREE from "three";
import { FaceRig, loadFace } from "./face-rig";

export type LivingPhotoApi = {
  setTalk(on: boolean): void;
  setSmile(on: boolean): void;
  dispose(): void;
};

export async function mountLivingPhoto(
  container: HTMLElement,
  url: string,
  { reducedMotion }: { reducedMotion: boolean }
): Promise<LivingPhotoApi> {
  const imgs = await loadFace(url, { keepBody: true });

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  // Kartu 3:4. Foto persegi selebar kartu, menempel di bawah.
  const ASPECT = 3 / 4;
  const VIEW_H = 1 / ASPECT;
  const camera = new THREE.PerspectiveCamera(18, ASPECT, 0.1, 20);
  camera.position.z = VIEW_H / 2 / Math.tan(THREE.MathUtils.degToRad(9));

  const rig = new FaceRig(imgs, 1.04, { outline: false });
  const holder = new THREE.Group();
  holder.position.y = -VIEW_H / 2 + 0.5;
  holder.add(rig.group);
  scene.add(holder);

  let talk = false;
  let smile = false;
  const pointer = { x: 0, y: 0 };
  const onPointer = (e: PointerEvent) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  function size() {
    const w = container.clientWidth || 1;
    renderer.setSize(w, w / ASPECT, false);
  }
  size();

  const clock = new THREE.Clock();
  let t = 0;
  function frame() {
    if (container.closest(".is-covered")) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    t += dt;
    rig.setTalk(talk);
    rig.setSmile(smile ? 1 : 0);
    rig.update(dt);

    // Napas & goyang kepala halus; kedalaman mengikuti kursor.
    const breath = Math.sin(t * 1.7);
    rig.group.scale.set(1 + breath * 0.004, 1 + breath * 0.008, 1);
    rig.group.position.y = breath * 0.004;
    const tx = pointer.x * 0.16 + Math.sin(t * 0.6) * 0.03;
    const ty = pointer.y * 0.1;
    holder.rotation.y += (tx - holder.rotation.y) * 0.06;
    holder.rotation.x += (ty - holder.rotation.x) * 0.06;
    holder.rotation.z = Math.sin(t * 0.9) * 0.012 + (talk ? Math.sin(t * 5) * 0.008 : 0);
    renderer.render(scene, camera);
  }

  let visible = true;
  const loop = () => renderer.setAnimationLoop(!reducedMotion && visible && !document.hidden ? frame : null);
  const io = new IntersectionObserver(([e]) => {
    visible = !!e?.isIntersecting;
    loop();
  });
  io.observe(container);
  document.addEventListener("visibilitychange", loop);
  const ro = new ResizeObserver(() => {
    size();
    if (reducedMotion) renderer.render(scene, camera);
  });
  ro.observe(container);

  rig.update(0);
  renderer.render(scene, camera);
  container.classList.add("is-ready");
  loop();

  return {
    setTalk(on) {
      talk = on;
    },
    setSmile(on) {
      smile = on;
    },
    dispose() {
      renderer.setAnimationLoop(null);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", loop);
      window.removeEventListener("pointermove", onPointer);
      rig.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
