"use client";

import { useEffect, useRef } from "react";
import { gsap, onIntroDone, ScrollTrigger } from "@/lib/motion";

type Step = { title: string; text: string };

const VW = 1200;
const BASE = 120;

/** Garis EKG dengan satu "detak" di tiap langkah. */
function ecgPath(centers: number[]) {
  let d = `M 0 ${BASE}`;
  for (const c of centers) {
    d += ` L ${c - 48} ${BASE} L ${c - 32} ${BASE - 12} L ${c - 18} ${BASE} L ${c - 6} ${BASE}`;
    d += ` L ${c} ${BASE - 96} L ${c + 10} ${BASE + 58} L ${c + 20} ${BASE} L ${c + 46} ${BASE}`;
    d += ` L ${c + 62} ${BASE - 18} L ${c + 80} ${BASE}`;
  }
  return `${d} L ${VW} ${BASE}`;
}

/**
 * Langkah-langkah mulai latihan sebagai rekaman detak jantung: saat discroll, playhead
 * menelusuri garis, BPM naik, dan tiap langkah menyala ketika detaknya terlewati.
 */
export function PulseTrace({ steps }: { steps: Step[] }) {
  const root = useRef<HTMLDivElement>(null);
  const centers = steps.map((_, i) => ((i + 0.5) / steps.length) * VW);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const lit = el.querySelector<SVGPathElement>(".pulse-lit")!;
    const glow = el.querySelector<SVGPathElement>(".pulse-glow")!;
    const head = el.querySelector<SVGGElement>(".pulse-head")!;
    const bpm = el.querySelector<HTMLElement>(".pulse-bpm b")!;
    const cards = Array.from(el.querySelectorAll<HTMLElement>(".step"));
    const len = lit.getTotalLength();

    const render = (p: number) => {
      const off = len * (1 - p);
      lit.style.strokeDashoffset = String(off);
      glow.style.strokeDashoffset = String(off);
      const pt = lit.getPointAtLength(len * p);
      head.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
      bpm.textContent = String(Math.round(68 + p * 84));
      cards.forEach((c, i) => c.classList.toggle("is-lit", pt.x >= centers[i] - 10));
    };

    [lit, glow].forEach((p) => (p.style.strokeDasharray = String(len)));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      render(1);
      return;
    }
    render(0);

    let st: ScrollTrigger | undefined;
    const cancel = onIntroDone(() => {
      // Dibuat setelah Animations (yang juga menunggu intro) supaya urutan pin benar.
      requestAnimationFrame(() => {
        const wide = window.matchMedia("(min-width: 900px)").matches;
        st = ScrollTrigger.create({
          trigger: el,
          start: wide ? "center center" : "top 65%",
          end: wide ? "+=130%" : "bottom 80%",
          pin: wide,
          scrub: 0.6,
          onUpdate: (self) => render(self.progress),
        });
        ScrollTrigger.refresh();
      });
    });

    return () => {
      cancel();
      st?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const d = ecgPath(centers);

  return (
    <div className="pulse" ref={root}>
      <div className="pulse-screen">
        <div className="pulse-hud mono" aria-hidden="true">
          <span>
            <i className="live-dot" /> Rekam detak
          </span>
          <span className="pulse-bpm">
            <b>68</b> BPM
          </span>
        </div>
        <svg viewBox={`0 0 ${VW} 220`} aria-hidden="true">
          <path d={d} className="pulse-base" />
          <path d={d} className="pulse-glow" />
          <path d={d} className="pulse-lit" />
          <g className="pulse-head">
            <line y1="-110" y2="96" className="pulse-cursor" />
            <circle r="7" className="pulse-dot" />
          </g>
        </svg>
      </div>
      <ol className="steps">
        {steps.map((s, i) => (
          <li key={s.title} className="step">
            <span className="step-no mono">Langkah {String(i + 1).padStart(2, "0")}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
