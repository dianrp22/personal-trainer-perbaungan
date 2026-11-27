"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import type { FigureKind } from "@/data/trainers";
import { useTalkLoop } from "./useTalkLoop";
import type { CrewApi, CrewPoint } from "@/lib/hero-scene";

export type CrewCard = {
  name: string;
  firstName: string;
  kind: FigureKind;
  /** Foto wajah untuk kepala 3D; kosong = kepala sementara. */
  face: string;
  /** Link wa.me; kosong kalau trainer belum punya WhatsApp. */
  wa: string;
  profile: string;
  lines: string[];
  /** Video AI/asli trainer (mp4); dipakai di mode video. */
  video: string;
  /** Versi WebM yang lebih ringan (opsional, dipilih otomatis kalau browser mendukung). */
  videoWebm: string;
  /** Gambar sebelum video jalan / pengganti kalau belum ada video. */
  poster: string;
};

/**
 * Hero 3D: para trainer berjalan ke arah pengunjung, bergantian "bicara" lewat balon kata,
 * dan masing-masing punya tombol WhatsApp yang menempel di bawah kakinya.
 */
export function HeroCrew({ crew }: { crew: CrewCard[] }) {
  const stage = useRef<HTMLDivElement>(null);
  const bubbles = useRef<(HTMLDivElement | null)[]>([]);
  const texts = useRef<(HTMLSpanElement | null)[]>([]);
  const tags = useRef<(HTMLDivElement | null)[]>([]);
  const api = useRef<CrewApi | null>(null);

  // Scene three.js — dimuat setelah halaman siap.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;

    const place = (pts: CrewPoint[]) => {
      pts.forEach((p, i) => {
        const b = bubbles.current[i];
        const t = tags.current[i];
        if (b) b.style.transform = `translate3d(${p.headX}px, ${p.headY}px, 0)`;
        if (t) t.style.transform = `translate3d(${p.footX}px, ${p.footY}px, 0)`;
      });
      el.parentElement?.classList.add("crew-placed");
    };

    const start = () => {
      import("@/lib/hero-scene")
        .then(({ mountCrewScene }) => {
          if (cancelled) return;
          api.current = mountCrewScene(el, {
            members: crew.map((c) => ({ kind: c.kind, face: c.face || undefined })),
            reducedMotion,
            onProject: place,
          });
        })
        .catch(() => {});
    };
    const idle = "requestIdleCallback" in window;
    const id = idle ? window.requestIdleCallback(start, { timeout: 1500 }) : globalThis.setTimeout(start, 400);

    return () => {
      cancelled = true;
      if (idle) window.cancelIdleCallback(id as number);
      else globalThis.clearTimeout(id as ReturnType<typeof setTimeout>);
      api.current?.dispose();
      api.current = null;
    };
  }, [crew]);

  const lines = useMemo(() => crew.map((c) => c.lines), [crew]);
  useTalkLoop(lines, bubbles, texts, (i, on) => api.current?.setTalking(i, on));

  return (
    <>
      <div className="hero-3d" ref={stage} aria-hidden="true" />
      <div className="crew-ui">
        {crew.map((c, i) => (
          <div key={c.profile}>
            <div
              className="crew-bubble"
              aria-hidden="true"
              ref={(el) => {
                bubbles.current[i] = el;
              }}
            >
              <p>
                <span
                  ref={(el) => {
                    texts.current[i] = el;
                  }}
                />
              </p>
            </div>
            <div
              className="crew-tag"
              ref={(el) => {
                tags.current[i] = el;
              }}
              onPointerEnter={() => api.current?.setFocus(i)}
              onPointerLeave={() => api.current?.setFocus(null)}
              onFocus={() => api.current?.setFocus(i)}
              onBlur={() => api.current?.setFocus(null)}
            >
              <div className="crew-tag-in">
                <span className="crew-name mono">{c.name}</span>
                {c.wa ? (
                  <a className="btn btn-wa btn-sm" href={c.wa} target="_blank" rel="noopener noreferrer">
                    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.48-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43a9.4 9.4 0 0 1 9.43 9.44c0 5.2-4.24 9.43-9.45 9.43m8.03-17.46A11.27 11.27 0 0 0 12.05.72C5.79.72.69 5.81.69 12.08c0 2 .52 3.96 1.52 5.68L.6 23.64l6.02-1.58a11.3 11.3 0 0 0 5.43 1.38h.01c6.26 0 11.36-5.1 11.36-11.36 0-3.03-1.18-5.89-3.33-8.03" />
                    </svg>
                    Chat {c.firstName}
                  </a>
                ) : (
                  <Link className="btn btn-ghost btn-sm" href={c.profile}>
                    Lihat profil
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
