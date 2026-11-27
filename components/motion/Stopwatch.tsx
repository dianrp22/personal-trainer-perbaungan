"use client";

import { useEffect, useRef } from "react";

/** Stopwatch yang berjalan sejak halaman dibuka — "sesi" pengunjung sudah dimulai. */
export function Stopwatch({ label = "Sesi Anda" }: { label?: string }) {
  const out = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const fmt = (n: number) => String(n).padStart(2, "0");
    const loop = () => {
      const ms = performance.now() - start;
      const m = Math.floor(ms / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      const cs = Math.floor((ms % 1000) / 10);
      if (out.current) out.current.textContent = `${fmt(m)}:${fmt(s)}.${fmt(cs)}`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="stopwatch" aria-hidden="true">
      <span className="sw-label">
        <span className="sw-rec" />
        {label}
      </span>
      <span className="sw-time" ref={out}>
        00:00.00
      </span>
    </div>
  );
}
