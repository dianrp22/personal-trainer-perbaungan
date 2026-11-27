"use client";

import { useEffect, useRef } from "react";
import { gsap, INTRO_EVENT } from "@/lib/motion";

const WARMUP = ["Pemanasan", "Peregangan", "Atur napas", "Siap start"];

// Value noise kecil untuk tepi "terbakar" yang tidak rata.
function hash(x: number, y: number) {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function noise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const sx = x - xi;
  const sy = y - yi;
  const s = (t: number) => t * t * (3 - 2 * t);
  const a = hash(xi, yi) + (hash(xi + 1, yi) - hash(xi, yi)) * s(sx);
  const b = hash(xi, yi + 1) + (hash(xi + 1, yi + 1) - hash(xi, yi + 1)) * s(sx);
  return a + (b - a) * s(sy);
}

/**
 * Veil pembuka: lampu start 3–2–1, daftar pemanasan, meter & persentase, lalu layar
 * "luruh" per piksel dari bawah. Hanya sekali per sesi (class `intro` di <html>).
 */
export function Preloader() {
  const ref = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const el = ref.current;
    const cv = canvas.current;
    if (!el || !cv || !root.classList.contains("intro")) return;

    const ctx = cv.getContext("2d")!;
    const W = (cv.width = window.innerWidth);
    const H = (cv.height = window.innerHeight);
    const CS = W < 640 ? 14 : 20;

    const paintBurn = (p: number) => {
      ctx.clearRect(0, 0, W, H);
      for (let y = 0; y < H; y += CS) {
        for (let x = 0; x < W; x += CS) {
          const v = 1 - y / H + (noise(x * 0.012, y * 0.012) - 0.5) * 0.45;
          if (v < p - 0.04) continue;
          if (v < p) {
            ctx.fillStyle = "#ff5a1f";
            ctx.fillRect(x, y, CS - 2, CS - 2);
          } else {
            ctx.fillStyle = "#0d0d0c";
            ctx.fillRect(x, y, CS + 0.5, CS + 0.5);
          }
        }
      }
    };

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      try {
        sessionStorage.setItem("ptp-intro", "1");
      } catch {}
      root.classList.remove("intro");
      window.dispatchEvent(new Event(INTRO_EVENT));
    };

    const q = gsap.utils.selector(el);
    const pct = q<HTMLElement>(".pre-pct")[0];
    const boot = q<HTMLElement>(".pre-boot li");
    const prog = { p: 0 };
    const burn = { p: -0.1 };

    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.set(q(".pre-num"), { yPercent: 110 })
      .from(q(".pre-fade"), { autoAlpha: 0, y: 12, duration: 0.6, stagger: 0.05 }, 0)
      .to(
        prog,
        {
          p: 1,
          duration: 1.6,
          ease: "power2.inOut",
          onUpdate: () => {
            const p = prog.p;
            gsap.set(q(".pre-meter i"), { scaleX: p });
            pct.textContent = String(Math.round(p * 100)).padStart(3, "0");
            boot.forEach((li, i) => li.classList.toggle("on", p >= ((i + 0.5) / boot.length) * 0.98));
          },
        },
        0.05
      );

    // 3, 2, 1 — tiap angka menyalakan satu lampu start.
    q(".pre-num").forEach((num, i) => {
      if (i === 3) return;
      const at = 0.15 + i * 0.4;
      tl.to(num, { yPercent: 0, duration: 0.45 }, at)
        .to(q(".pre-light")[i], { backgroundColor: "#ff5a1f", boxShadow: "0 0 32px #ff5a1f", duration: 0.12 }, at)
        .to(num, { yPercent: -110, duration: 0.35, ease: "expo.in" }, at + 0.32);
    });

    tl.to(q(".pre-go"), { yPercent: 0, duration: 0.45 }, 1.35)
      .to(q(".pre-light"), { backgroundColor: "#c6ff3d", boxShadow: "0 0 32px #c6ff3d", duration: 0.1 }, 1.35)
      .to(q(".pre-ui"), { autoAlpha: 0, duration: 0.25, ease: "power2.in" }, 1.8)
      .set(el, { backgroundColor: "transparent" }, 2.0)
      .call(() => paintBurn(-0.1), [], 2.0)
      .to(
        burn,
        { p: 1.5, duration: 1.1, ease: "power2.in", onUpdate: () => paintBurn(burn.p) },
        2.0
      )
      .call(finish, [], 2.35)
      .set(el, { display: "none" });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="preloader" ref={ref} role="status" aria-live="polite">
      <canvas ref={canvas} className="pre-burn" aria-hidden="true" />
      <div className="pre-ui" aria-hidden="true">
        <div className="pre-center">
          <div className="pre-lights pre-fade">
            <span className="pre-light" />
            <span className="pre-light" />
            <span className="pre-light" />
          </div>
          <div className="pre-count">
            <span className="pre-num">3</span>
            <span className="pre-num">2</span>
            <span className="pre-num">1</span>
            <span className="pre-num pre-go">GO</span>
          </div>
        </div>
        <ul className="pre-boot pre-fade">
          {WARMUP.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
        <span className="pre-pct pre-fade">000</span>
        <span className="pre-meter">
          <i />
        </span>
      </div>
      <span className="sr-only">Memuat halaman</span>
    </div>
  );
}
