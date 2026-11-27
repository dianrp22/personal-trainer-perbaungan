"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { gsap, onIntroDone } from "@/lib/motion";
import type { CrewCard } from "./HeroCrew";
import { useTalkLoop } from "./useTalkLoop";
import type { LivingPhotoApi } from "@/lib/living-photo";

/**
 * Hero mode video: tiap trainer tampil sebagai kartu video (mis. video AI dari fotonya:
 * berjalan ke arah kamera sambil menyapa). Kartu melayang, miring mengikuti kursor,
 * dan punya balon kata + tombol WhatsApp sendiri.
 */
export function VideoCrew({ crew }: { crew: CrewCard[] }) {
  const root = useRef<HTMLDivElement>(null);
  const bubbles = useRef<(HTMLElement | null)[]>([]);
  const texts = useRef<(HTMLElement | null)[]>([]);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const lives = useRef<(HTMLDivElement | null)[]>([]);
  const liveApi = useRef<(LivingPhotoApi | null)[]>([]);

  const lines = useMemo(() => crew.map((c) => c.lines), [crew]);
  useTalkLoop(lines, bubbles, texts, (i, on) => liveApi.current[i]?.setTalk(on));

  // Foto hidup untuk kartu yang belum punya video tapi punya foto wajah.
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;
    const apis = liveApi.current;
    crew.forEach((c, i) => {
      const el = lives.current[i];
      if (c.video || !c.face || !el) return;
      import("@/lib/living-photo")
        .then(({ mountLivingPhoto }) => mountLivingPhoto(el, c.face, { reducedMotion }))
        .then((api) => {
          if (cancelled) api.dispose();
          else apis[i] = api;
        })
        .catch(() => {}); // WebGL/foto gagal: foto statis tetap tampil
    });
    return () => {
      cancelled = true;
      apis.forEach((a) => a?.dispose());
      apis.length = 0;
    };
  }, [crew]);

  // Video baru diunduh setelah halaman tampil (intro selesai) supaya loading awal tetap ringan.
  // Diputar sekali, jeda di akhir (dia sedang melambai), lalu memudar dan mulai lagi.
  useEffect(() => {
    const timers: number[] = [];
    const cleanups: (() => void)[] = [];
    const cancel = onIntroDone(() => {
      const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (saveData || reduced) return; // cukup poster
      videos.current.forEach((v) => {
        if (!v || v.src) return;
        const webm = v.dataset.webm;
        v.src = webm && v.canPlayType('video/webm; codecs="vp9"') ? webm : v.dataset.src!;
        v.preload = "auto";
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
                }, 350)
              );
            }, 3200)
          );
        };
        v.addEventListener("ended", ended);
        cleanups.push(() => v.removeEventListener("ended", ended));
        play();
      });
    });
    return () => {
      cancel();
      timers.forEach(clearTimeout);
      cleanups.forEach((c) => c());
    };
  }, []);

  // Masuk dari bawah setelah intro, lalu melayang & miring mengikuti kursor.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>(".vcard"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const ctx = gsap.context(() => {}, el);

    gsap.set(cards, { autoAlpha: 0, y: 120, rotate: (i) => (i % 2 ? 10 : -10) });
    const cancel = onIntroDone(() => {
      ctx.add(() => {
        gsap.to(cards, { autoAlpha: 1, y: 0, rotate: (i) => (i % 2 ? 3 : -4), duration: 1.4, ease: "expo.out", stagger: 0.15, delay: 0.3 });
        cards.forEach((c, i) => {
          gsap.to(c.querySelector(".vcard-float"), {
            y: -10,
            duration: 2.2 + i * 0.4,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        });
      });
    });

    const fine = window.matchMedia("(pointer: fine)").matches;
    const tilts = cards.map((c) => ({
      rx: gsap.quickTo(c.querySelector(".vcard-frame"), "rotateX", { duration: 0.8, ease: "power3" }),
      ry: gsap.quickTo(c.querySelector(".vcard-frame"), "rotateY", { duration: 0.8, ease: "power3" }),
    }));
    const move = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      tilts.forEach((t) => {
        t.ry(x * 16);
        t.rx(-y * 12);
      });
    };
    if (fine) window.addEventListener("pointermove", move, { passive: true });

    return () => {
      cancel();
      window.removeEventListener("pointermove", move);
      ctx.revert();
    };
  }, []);

  return (
    <div className="vcrew" ref={root}>
      {crew.map((c, i) => (
        <figure
          key={c.profile}
          className="vcard"
          onPointerEnter={() => liveApi.current[i]?.setSmile(true)}
          onPointerLeave={() => liveApi.current[i]?.setSmile(false)}
        >
          <div className="vcard-float">
            <div
              className="crew-bubble vcard-bubble"
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

            <div className="vcard-frame">
              {c.video ? (
                <video
                  ref={(el) => {
                    videos.current[i] = el;
                  }}
                  data-src={c.video}
                  data-webm={c.videoWebm || undefined}
                  poster={c.poster || undefined}
                  muted
                  playsInline
                  preload="none"
                  aria-label={`Video ${c.name}`}
                />
              ) : c.face ? (
                <div
                  className="vcard-live"
                  ref={(el) => {
                    lives.current[i] = el;
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.face} alt={`Foto ${c.name}`} />
                </div>
              ) : c.poster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.poster} alt={`Foto ${c.name}`} />
              ) : (
                <span className="vcard-empty">
                  <b>{c.firstName.slice(0, 1)}</b>
                  <span className="mono">Video segera</span>
                </span>
              )}
              <span className="vcard-no mono">#{String(i + 1).padStart(2, "0")}</span>
            </div>

            <figcaption className="vcard-cap">
              <span className="crew-name mono">{c.name}</span>
              {c.wa ? (
                <a className="btn btn-wa btn-sm" href={c.wa} target="_blank" rel="noopener noreferrer">
                  Chat {c.firstName}
                </a>
              ) : (
                <Link className="btn btn-ghost btn-sm" href={c.profile}>
                  Lihat profil
                </Link>
              )}
            </figcaption>
          </div>
        </figure>
      ))}
    </div>
  );
}
