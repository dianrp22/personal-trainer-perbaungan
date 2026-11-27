"use client";

import { useEffect, useRef } from "react";
import { gsap, onIntroDone } from "@/lib/motion";

// Lintasan lari (stadion) dari garis-garis lane, dimiringkan 3D. Satu "pelari" berputar terus.
const W = 1000;
const H = 620;
const CX = W / 2;
const CY = H / 2;
const STRAIGHT = 420;
const LANES = [150, 172, 194, 216, 238, 260, 282];
const ACTIVE = 3;

function stadium(r: number) {
  const x1 = CX - STRAIGHT / 2;
  const x2 = CX + STRAIGHT / 2;
  return `M ${x1} ${CY - r} H ${x2} A ${r} ${r} 0 0 1 ${x2} ${CY + r} H ${x1} A ${r} ${r} 0 0 1 ${x1} ${CY - r} Z`;
}

export function TrackOval() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {}, el);
    const q = gsap.utils.selector(el);

    const cancel = onIntroDone(() => {
      ctx.add(() => {
        const lanes = q<SVGPathElement>(".lane");
        const comet = q<SVGPathElement>(".comet")[0];
        const runner = q<SVGGElement>(".runner")[0];
        const active = lanes[ACTIVE];
        const len = active.getTotalLength();
        const seg = len * 0.16;

        if (reduced) {
          gsap.set(runner, { autoAlpha: 0 });
          return;
        }

        // Lane tergambar satu per satu, lalu garis start & angka lane muncul.
        lanes.forEach((p) => {
          const l = p.getTotalLength();
          gsap.set(p, { strokeDasharray: l, strokeDashoffset: l });
        });
        gsap.set(comet, { strokeDasharray: `${seg} ${len - seg}`, strokeDashoffset: 0, autoAlpha: 0 });
        gsap.set(runner, { autoAlpha: 0 });

        // Kemiringan dasar diatur lewat GSAP (bukan CSS) supaya bisa dianimasikan dengan rapi.
        gsap.set(q(".track-3d"), { transformPerspective: 1400, rotateX: 58, rotateZ: -18 });

        // Lane tergambar saat lintasan masuk layar, lalu pelari mulai berputar.
        const tl = gsap.timeline({
          defaults: { ease: "expo.inOut" },
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
        tl.to(lanes, { strokeDashoffset: 0, duration: 2.2, stagger: 0.08 }, 0)
          .from(q(".start-line, .lane-no"), { autoAlpha: 0, duration: 0.6, stagger: 0.04, ease: "power2.out" }, 1.4)
          .from(q(".track-3d"), { rotateX: 20, rotateZ: -40, scale: 0.7, duration: 2.6, ease: "expo.out" }, 0)
          .to([comet, runner], { autoAlpha: 1, duration: 0.4 }, 1.8)
          // Satu putaran: ekor (dash) dan titik pelari bergerak sinkron.
          .to(comet, { strokeDashoffset: -len, duration: 7, ease: "none", repeat: -1 }, 1.8)
          .to(
            runner,
            {
              duration: 7,
              ease: "none",
              repeat: -1,
              motionPath: { path: active, align: active, alignOrigin: [0.5, 0.5], start: seg / len, end: 1 + seg / len },
            },
            1.8
          );

        // Scroll: lintasan berputar di bidangnya sendiri.
        gsap.fromTo(
          q("svg"),
          { rotate: 12 },
          {
            rotate: -24,
            scale: 1.12,
            ease: "none",
            transformOrigin: "50% 50%",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 },
          }
        );
      });
    });

    return () => {
      cancel();
      ctx.revert();
    };
  }, []);

  const startX = CX - STRAIGHT / 2 + 70;

  return (
    <div className="track" ref={root} aria-hidden="true">
      <div className="track-3d">
        <svg viewBox={`0 0 ${W} ${H}`} fill="none">
          <defs>
            <pattern id="checker" width="12" height="12" patternUnits="userSpaceOnUse">
              <rect width="6" height="6" fill="currentColor" />
              <rect x="6" y="6" width="6" height="6" fill="currentColor" />
            </pattern>
          </defs>
          {/* Infield */}
          <path d={stadium(LANES[0] - 6)} className="infield" />
          {LANES.map((r, i) => (
            <path key={r} d={stadium(r)} className={`lane${i === ACTIVE ? " lane-active" : ""}`} />
          ))}
          <rect
            className="start-line"
            x={startX}
            y={CY - LANES[LANES.length - 1]}
            width="12"
            height={LANES[LANES.length - 1] - LANES[0]}
            fill="url(#checker)"
          />
          {LANES.slice(0, -1).map((r, i) => (
            <text key={r} className="lane-no" x={startX - 18} y={CY - r - 6}>
              {i + 1}
            </text>
          ))}
          <path d={stadium(LANES[ACTIVE])} className="comet" />
          <g className="runner">
            <circle r="16" className="runner-glow" />
            <circle r="6" className="runner-dot" />
          </g>
        </svg>
      </div>
    </div>
  );
}
