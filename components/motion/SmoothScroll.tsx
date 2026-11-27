"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, motion, onIntroDone, ScrollTrigger } from "@/lib/motion";

/** Smooth scroll (Lenis) yang disinkronkan dengan GSAP ScrollTrigger. */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    motion.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    if (document.documentElement.classList.contains("intro")) lenis.stop();
    const cancelIntro = onIntroDone(() => lenis.start());

    // Link ke anchor di halaman yang sama (mis. "/#trainer" saat sudah di "/") → scroll halus.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return;
      const el = url.hash === "#top" ? 0 : document.querySelector<HTMLElement>(decodeURIComponent(url.hash));
      if (el === null) return;
      e.preventDefault();
      e.stopPropagation();
      lenis.scrollTo(el, { duration: 1.4 });
      history.replaceState(null, "", url.hash);
    };
    document.addEventListener("click", onClick, true);

    return () => {
      cancelIntro();
      document.removeEventListener("click", onClick, true);
      gsap.ticker.remove(tick);
      lenis.destroy();
      motion.lenis = null;
    };
  }, []);

  // Pindah halaman → mulai dari atas (kecuali ada #anchor).
  useEffect(() => {
    const lenis = motion.lenis;
    if (!lenis) return;
    if (window.location.hash) {
      const el = document.querySelector(decodeURIComponent(window.location.hash));
      if (el) requestAnimationFrame(() => lenis.scrollTo(el as HTMLElement, { immediate: true }));
    } else {
      lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  return null;
}
