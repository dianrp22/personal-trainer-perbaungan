"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/motion";

/**
 * Pita teks berjalan. Kecepatan & arah mengikuti scroll: makin cepat scroll, makin
 * kencang dan sedikit miring; scroll ke atas membalik arah.
 */
export function Marquee({
  items,
  className = "",
  reverse = false,
  duration = 28,
}: {
  items: string[];
  className?: string;
  reverse?: boolean;
  duration?: number;
}) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tween = gsap.fromTo(
      el,
      { xPercent: reverse ? -50 : 0 },
      { xPercent: reverse ? 0 : -50, duration, ease: "none", repeat: -1 }
    );
    const skew = gsap.quickTo(el, "skewX", { duration: 0.4, ease: "power3" });

    let dir = 1;
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        dir = self.direction;
      },
    });

    const tick = () => {
      const v = st.getVelocity();
      const target = dir * (1 + Math.min(Math.abs(v) / 220, 7));
      tween.timeScale(gsap.utils.interpolate(tween.timeScale(), target, 0.08));
      skew(gsap.utils.clamp(-10, 10, v / -180));
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      st.kill();
      tween.kill();
      gsap.set(el, { clearProps: "all" });
    };
  }, [reverse, duration]);

  const row = (hidden: boolean) => (
    <div className="mq-row" aria-hidden={hidden || undefined}>
      {items.map((t, i) => (
        <span className="mq-item" key={i}>
          {t}
          <span className="mq-sep" aria-hidden="true" />
        </span>
      ))}
    </div>
  );

  return (
    <div className={`marquee ${className}`}>
      <div className="mq-track" ref={track}>
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
