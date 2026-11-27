"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { gsap, onIntroDone } from "@/lib/motion";
import type { CrewCard } from "./HeroCrew";
import { useTalkLoop } from "./useTalkLoop";

export type FilmPerson = CrewCard & { label: string };

/**
 * Hero mode "film": satu video besar sebagai latar penuh (mis. para trainer selesai latihan
 * lalu berjalan ke arah kamera). Tombol chat tiap trainer ada di panel kanan, lengkap
 * dengan balon kata yang mengetik sendiri.
 */
export function HeroFilm({
  video,
  videoWebm,
  poster,
  people,
}: {
  video: string;
  videoWebm: string;
  poster: string;
  people: FilmPerson[];
}) {
  const vid = useRef<HTMLVideoElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const bubbles = useRef<(HTMLElement | null)[]>([]);
  const texts = useRef<(HTMLElement | null)[]>([]);

  const lines = useMemo(() => people.map((p) => p.lines), [people]);
  useTalkLoop(lines, bubbles, texts);

  // Video diunduh setelah halaman tampil. Diputar sekali, jeda di frame terakhir, lalu ulang.
  useEffect(() => {
    const v = vid.current;
    if (!v || !video) return;
    const timers: number[] = [];
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const play = () => void v.play().catch(() => {});
    const ended = () => {
      timers.push(
        window.setTimeout(() => {
          v.classList.add("is-fading");
          timers.push(
            window.setTimeout(() => {
              v.currentTime = 0;
              play();
              v.classList.remove("is-fading");
            }, 450)
          );
        }, 3500)
      );
    };
    v.addEventListener("ended", ended);
    const cancel = onIntroDone(() => {
      if (saveData || reduced) return; // cukup poster
      v.src = videoWebm && v.canPlayType('video/webm; codecs="vp9"') ? videoWebm : video;
      v.preload = "auto";
      play();
    });
    return () => {
      cancel();
      v.removeEventListener("ended", ended);
      timers.forEach(clearTimeout);
    };
  }, [video, videoWebm]);

  // Panel trainer masuk dari kanan setelah intro.
  useEffect(() => {
    const el = panel.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = el.querySelectorAll(".film-person");
    gsap.set(items, { autoAlpha: 0, x: 60 });
    const cancel = onIntroDone(() => {
      gsap.to(items, { autoAlpha: 1, x: 0, duration: 1.2, ease: "expo.out", stagger: 0.12, delay: 0.6 });
    });
    return () => {
      cancel();
      gsap.killTweensOf(items);
    };
  }, []);

  return (
    <>
      <div className="film" aria-hidden="true">
        {video || poster ? (
          <video ref={vid} className="film-video" poster={poster || undefined} muted playsInline preload="none" />
        ) : null}
        <div className="film-shade" />
        <span className="film-tag mono">Ilustrasi video AI</span>
      </div>

      <div className="film-crew" ref={panel}>
        {people.map((p, i) => (
          <div key={p.profile} className="film-person">
            <div
              className="crew-bubble film-bubble"
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
            <div className="film-person-in">
              <span className="film-no mono">{String(i + 1).padStart(2, "0")}</span>
              <span className="film-who">
                <b>
                  <span className="fw-full">{p.name}</span>
                  <span className="fw-short">{p.firstName}</span>
                </b>
                <span className="mono">{p.label}</span>
              </span>
              {p.wa ? (
                <a className="btn btn-wa btn-sm" href={p.wa} target="_blank" rel="noopener noreferrer">
                  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                    <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.48-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43a9.4 9.4 0 0 1 9.43 9.44c0 5.2-4.24 9.43-9.45 9.43m8.03-17.46A11.27 11.27 0 0 0 12.05.72C5.79.72.69 5.81.69 12.08c0 2 .52 3.96 1.52 5.68L.6 23.64l6.02-1.58a11.3 11.3 0 0 0 5.43 1.38h.01c6.26 0 11.36-5.1 11.36-11.36 0-3.03-1.18-5.89-3.33-8.03" />
                  </svg>
                  Chat<span className="btn-name"> {p.firstName}</span>
                </a>
              ) : (
                <Link className="btn btn-ghost btn-sm" href={p.profile}>
                  Lihat profil
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
