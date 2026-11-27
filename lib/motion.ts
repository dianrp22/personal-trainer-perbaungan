// Satu tempat untuk GSAP + plugin, supaya plugin hanya didaftarkan sekali.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import type Lenis from "lenis";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, MotionPathPlugin);
}

export { gsap, ScrollTrigger, SplitText };

/** Instance Lenis aktif (null kalau reduced motion). */
export const motion: { lenis: Lenis | null } = { lenis: null };

export const INTRO_EVENT = "ptp:intro";

/** Jalankan `cb` setelah preloader selesai (atau langsung kalau preloader tidak diputar). */
export function onIntroDone(cb: () => void): () => void {
  const root = document.documentElement;
  if (!root.classList.contains("intro")) {
    cb();
    return () => {};
  }
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    cb();
  };
  window.addEventListener(INTRO_EVENT, run, { once: true });
  // Jaga-jaga kalau preloader gagal jalan.
  const t = window.setTimeout(run, 5000);
  return () => {
    done = true;
    window.removeEventListener(INTRO_EVENT, run);
    window.clearTimeout(t);
  };
}
