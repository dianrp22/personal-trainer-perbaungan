"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap, onIntroDone, ScrollTrigger, SplitText } from "@/lib/motion";

/*
 * Semua animasi scroll dipasang lewat data-attribute, supaya halaman tetap server component
 * (HTML lengkap untuk SEO) dan animasinya cukup ditulis sekali di sini.
 *
 *   data-split="lines|words|chars"  teks muncul dari balik mask
 *   data-reveal                     fade + naik
 *   data-load                       (bersama dua di atas) jalan saat halaman dibuka, bukan saat discroll
 *   data-delay="0.2"                jeda
 *   data-parallax="0.3"             bergerak lebih lambat/cepat dari scroll
 *   data-scrub-x="-30"              geser horizontal (xPercent) mengikuti scroll
 *   data-count                      angka menghitung naik ke nilai teksnya
 *   data-draw                       path SVG di dalamnya tergambar mengikuti scroll
 *   data-horizontal                 section di-pin, isi [data-horizontal-track] digeser ke samping
 *   data-magnetic                   tombol "menempel" ke kursor
 *   data-stagger                    anak-anaknya muncul bergantian
 *   data-scatter                    huruf beterbangan dari posisi acak lalu menyatu
 *   data-scramble                   huruf acak yang "terkunci" satu per satu
 *   data-stack                      panel sticky yang mengecil saat section berikut menimpanya
 */

const EASE = "expo.out";

/** Angka acak yang stabil (sama tiap render) untuk posisi awal huruf. */
function rand(a: number, b: number, c: number) {
  let h = Math.imul(a + 1, 374761393) ^ Math.imul(b + 7, 668265263) ^ Math.imul(c, 2147483587);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

export function Animations() {
  const pathname = usePathname();

  useEffect(() => {
    const mm = gsap.matchMedia();
    const splits: SplitText[] = [];

    const cancelIntro = onIntroDone(() => {
      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          desktop: "(min-width: 900px) and (pointer: fine)",
          wide: "(min-width: 900px)",
        },
        (ctx) => {
          const { motion, desktop, wide } = ctx.conditions as Record<string, boolean>;
          if (!motion) return;

          const delayOf = (el: Element) => parseFloat((el as HTMLElement).dataset.delay || "0");
          const isLoad = (el: Element) => el.hasAttribute("data-load");

          // --- Teks split -------------------------------------------------------
          gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
            const type = (el.dataset.split || "lines") as "lines" | "words" | "chars";
            const split = SplitText.create(el, {
              type: type === "lines" ? "lines" : `lines,${type}`,
              mask: "lines",
              linesClass: "split-line",
              autoSplit: true,
              onSplit(self) {
                gsap.set(el, { visibility: "visible" });
                const targets = type === "lines" ? self.lines : type === "words" ? self.words : self.chars;
                return gsap.from(targets, {
                  yPercent: 120,
                  rotate: type === "chars" ? 6 : 0,
                  duration: type === "chars" ? 1.1 : 1.2,
                  ease: EASE,
                  stagger: type === "chars" ? 0.028 : type === "words" ? 0.04 : 0.09,
                  delay: delayOf(el),
                  scrollTrigger: isLoad(el) ? undefined : { trigger: el, start: "top 88%", once: true },
                });
              },
            });
            splits.push(split);
          });

          // --- Fade up ----------------------------------------------------------
          gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
            gsap.from(el, {
              autoAlpha: 0,
              y: 48,
              duration: 1.2,
              ease: EASE,
              delay: delayOf(el),
              scrollTrigger: isLoad(el) ? undefined : { trigger: el, start: "top 90%", once: true },
            });
          });

          gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((el) => {
            gsap.from(el.children, {
              autoAlpha: 0,
              y: 60,
              duration: 1.1,
              ease: EASE,
              stagger: 0.1,
              delay: delayOf(el),
              scrollTrigger: isLoad(el) ? undefined : { trigger: el, start: "top 85%", once: true },
            });
          });

          // --- Parallax & geser horizontal --------------------------------------
          gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
            const speed = parseFloat(el.dataset.parallax || "0.2");
            gsap.to(el, {
              yPercent: speed * 100,
              ease: "none",
              scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
            });
          });

          gsap.utils.toArray<HTMLElement>("[data-scrub-x]").forEach((el) => {
            const to = parseFloat(el.dataset.scrubX || "-20");
            gsap.fromTo(
              el,
              { xPercent: 0 },
              {
                xPercent: to,
                ease: "none",
                scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 },
              }
            );
          });

          // --- Counter ----------------------------------------------------------
          gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
            const final = parseInt(el.textContent || "0", 10);
            const pad = (el.textContent || "").trim().length;
            const obj = { v: 0 };
            el.textContent = "0".padStart(pad, "0");
            gsap.to(obj, {
              v: final,
              duration: 2,
              ease: "power3.out",
              delay: delayOf(el),
              onUpdate: () => {
                el.textContent = String(Math.round(obj.v)).padStart(pad, "0");
              },
              scrollTrigger: { trigger: el, start: "top 90%", once: true },
            });
          });

          // --- Huruf beterbangan lalu menyatu (angka besar) ------------------------
          gsap.utils.toArray<HTMLElement>("[data-scatter]").forEach((el, n) => {
            const split = SplitText.create(el, { type: "chars" });
            splits.push(split);
            gsap.set(el, { visibility: "visible" });
            gsap.from(split.chars, {
              x: (i) => (rand(i, n, 1) - 0.5) * 220,
              y: (i) => (rand(i, n, 2) - 0.2) * 180,
              rotate: (i) => (rand(i, n, 3) - 0.5) * 90,
              autoAlpha: 0,
              duration: 1.6,
              ease: "elastic.out(1, 0.55)",
              stagger: 0.07,
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            });
          });

          // --- Teks acak lalu terbaca (scramble) --------------------------------
          const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/_";
          gsap.utils.toArray<HTMLElement>("[data-scramble]").forEach((el, n) => {
            const target = el.textContent || "";
            const state = { p: 0 };
            gsap.to(state, {
              p: 1,
              duration: 0.9 + target.length * 0.02,
              ease: "none",
              delay: 0.25 + (n % 6) * 0.08,
              scrollTrigger: { trigger: el, start: "top 95%", once: true },
              onStart: () => el.setAttribute("aria-label", target),
              onUpdate: () => {
                const shown = Math.floor(state.p * target.length);
                el.textContent = target
                  .split("")
                  .map((ch, k) => (k < shown || ch === " " ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
                  .join("");
              },
              onComplete: () => {
                el.textContent = target;
              },
            });
          });

          // --- Sticky stack: panel mengecil & menggelap saat ditimpa section berikut
          gsap.utils.toArray<HTMLElement>("[data-stack]").forEach((panel) => {
            const next = panel.nextElementSibling;
            const inner = panel.querySelector<HTMLElement>(".stack-inner");
            const shade = panel.querySelector<HTMLElement>(".stack-shade");
            if (!next || !inner) return;
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: next,
                start: "top bottom",
                end: "top top",
                scrub: true,
                // Tertutup penuh → sembunyikan (dan hentikan render 3D di dalamnya).
                onLeave: () => panel.classList.add("is-covered"),
                onEnterBack: () => panel.classList.remove("is-covered"),
              },
            });
            tl.to(inner, { scale: wide ? 0.9 : 0.96, borderRadius: wide ? 28 : 16, ease: "none" }, 0);
            if (shade) tl.to(shade, { opacity: 0.6, ease: "none" }, 0);
          });

          // --- Garis SVG tergambar ----------------------------------------------
          gsap.utils.toArray<HTMLElement>("[data-draw]").forEach((wrap) => {
            wrap.querySelectorAll<SVGGeometryElement>("path, line, polyline").forEach((p) => {
              const len = p.getTotalLength();
              gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
              gsap.to(p, {
                strokeDashoffset: 0,
                ease: "none",
                scrollTrigger: { trigger: wrap, start: "top 75%", end: "bottom 60%", scrub: 0.8 },
              });
            });
          });

          // --- Section horizontal (desktop) -------------------------------------
          if (wide) {
            gsap.utils.toArray<HTMLElement>("[data-horizontal]").forEach((section) => {
              const track = section.querySelector<HTMLElement>("[data-horizontal-track]");
              const bar = section.querySelector<HTMLElement>("[data-horizontal-progress]");
              if (!track) return;
              const distance = () => track.scrollWidth - window.innerWidth;
              const tween = gsap.to(track, {
                x: () => -distance(),
                ease: "none",
                scrollTrigger: {
                  trigger: section,
                  start: "top top",
                  end: () => `+=${distance()}`,
                  pin: true,
                  scrub: 0.8,
                  refreshPriority: 1,
                  invalidateOnRefresh: true,
                  onUpdate: (self) => bar && gsap.set(bar, { scaleX: self.progress }),
                },
              });
              // Kartu di dalamnya sedikit miring lalu tegak saat lewat tengah layar.
              track.querySelectorAll<HTMLElement>("[data-horizontal-item]").forEach((item) => {
                gsap.from(item, {
                  rotate: 4,
                  yPercent: 12,
                  ease: "none",
                  scrollTrigger: {
                    trigger: item,
                    containerAnimation: tween,
                    start: "left right",
                    end: "center center",
                    scrub: true,
                  },
                });
              });
            });
          }

          // --- Tombol magnetik (desktop) ----------------------------------------
          if (desktop) {
            const cleanups: (() => void)[] = [];
            gsap.utils.toArray<HTMLElement>("[data-magnetic]").forEach((el) => {
              const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
              const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
              const move = (e: MouseEvent) => {
                const r = el.getBoundingClientRect();
                xTo((e.clientX - (r.left + r.width / 2)) * 0.35);
                yTo((e.clientY - (r.top + r.height / 2)) * 0.45);
              };
              const leave = () => {
                gsap.to(el, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.35)" });
              };
              el.addEventListener("mousemove", move);
              el.addEventListener("mouseleave", leave);
              cleanups.push(() => {
                el.removeEventListener("mousemove", move);
                el.removeEventListener("mouseleave", leave);
              });
            });
            return () => cleanups.forEach((c) => c());
          }
        }
      );

      // Font selesai dimuat → ukur ulang posisi trigger.
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    });

    return () => {
      cancelIntro();
      splits.forEach((s) => s.revert());
      mm.revert();
    };
  }, [pathname]);

  return null;
}
