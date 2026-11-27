"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion";

/** Kursor custom: titik + cincin. Elemen dengan data-cursor="Teks" memunculkan label. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!mq.matches || !dot.current || !ring.current || !label.current) return;
    const d = dot.current;
    const r = ring.current;
    const l = label.current;
    document.documentElement.classList.add("has-cursor");

    gsap.set([d, r], { xPercent: -50, yPercent: -50, autoAlpha: 0 });
    const dx = gsap.quickTo(d, "x", { duration: 0.08, ease: "power3" });
    const dy = gsap.quickTo(d, "y", { duration: 0.08, ease: "power3" });
    const rx = gsap.quickTo(r, "x", { duration: 0.45, ease: "power3" });
    const ry = gsap.quickTo(r, "y", { duration: 0.45, ease: "power3" });

    let visible = false;
    const last = { x: -1, y: -1 };
    const move = (e: PointerEvent) => {
      last.x = e.clientX;
      last.y = e.clientY;
      if (!visible) {
        visible = true;
        gsap.set([d, r], { x: e.clientX, y: e.clientY });
        gsap.to([d, r], { autoAlpha: 1, duration: 0.3 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };

    let state = "";
    const over = (e: PointerEvent) => updateFor(e.target as Element | null);
    // Scroll tidak memicu pointerover, jadi elemen di bawah kursor dicek ulang saat scroll.
    const rescan = () => {
      if (last.x >= 0) updateFor(document.elementFromPoint(last.x, last.y));
    };
    const updateFor = (t: Element | null) => {
      const labelled = t?.closest?.<HTMLElement>("[data-cursor]");
      const interactive = t?.closest?.("a, button, summary, [role='button']");
      const next = labelled ? `label:${labelled.dataset.cursor}` : interactive ? "hover" : "";
      if (next === state) return;
      state = next;
      if (labelled) {
        l.textContent = labelled.dataset.cursor || "";
        gsap.to(r, { width: 104, height: 104, backgroundColor: "#ff5a1f", borderColor: "#ff5a1f", duration: 0.4, ease: "expo.out" });
        gsap.to(l, { autoAlpha: 1, scale: 1, duration: 0.3, delay: 0.05 });
        gsap.to(d, { scale: 0, duration: 0.2 });
      } else {
        gsap.to(l, { autoAlpha: 0, scale: 0.6, duration: 0.15 });
        gsap.to(d, { scale: interactive ? 0 : 1, duration: 0.2 });
        gsap.to(r, {
          width: interactive ? 64 : 36,
          height: interactive ? 64 : 36,
          backgroundColor: interactive ? "rgba(255,90,31,0.15)" : "rgba(255,90,31,0)",
          borderColor: interactive ? "#ff5a1f" : "#8a8a85",
          duration: 0.4,
          ease: "expo.out",
        });
      }
    };

    const leave = () => {
      visible = false;
      gsap.to([d, r], { autoAlpha: 0, duration: 0.2 });
    };
    const down = () => gsap.to(r, { scale: 0.8, duration: 0.15 });
    const up = () => gsap.to(r, { scale: 1, duration: 0.4, ease: "elastic.out(1,0.4)" });

    window.addEventListener("pointermove", move);
    window.addEventListener("scroll", rescan, { passive: true });
    document.addEventListener("pointerover", over);
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", rescan);
      document.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  return (
    <>
      <div className="cursor-ring" ref={ring} aria-hidden="true">
        <span ref={label} className="cursor-label" />
      </div>
      <div className="cursor-dot" ref={dot} aria-hidden="true" />
    </>
  );
}
