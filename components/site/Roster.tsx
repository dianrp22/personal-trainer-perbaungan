"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Trainer } from "@/data/trainers";
import { gsap } from "@/lib/motion";
import { initials, trainerPath, trainerWhatsappLink } from "@/lib/helpers";
import { WhatsAppButton } from "./WhatsAppButton";
import { PinIcon } from "./Icons";

/**
 * Daftar trainer gaya "roster": satu baris per trainer dengan nama besar.
 * Di desktop, kartu jersey mengikuti kursor saat baris di-hover.
 */
export function Roster({ trainers }: { trainers: Trainer[] }) {
  const [active, setActive] = useState(-1);
  const card = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = card.current;
    const list = listRef.current;
    if (!el || !list) return;
    const mq = window.matchMedia("(pointer: fine) and (min-width: 900px) and (prefers-reduced-motion: no-preference)");
    if (!mq.matches) return;

    gsap.set(el, { xPercent: -50, yPercent: -50, scale: 0, rotate: -8 });
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
    const rTo = gsap.quickTo(el, "rotate", { duration: 0.8, ease: "power3" });
    let lastX = 0;

    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      rTo(gsap.utils.clamp(-14, 14, (e.clientX - lastX) * 0.6));
      lastX = e.clientX;
    };
    const enter = (e: PointerEvent) => {
      gsap.set(el, { x: e.clientX, y: e.clientY });
      lastX = e.clientX;
      gsap.to(el, { scale: 1, duration: 0.6, ease: "expo.out" });
    };
    const leave = () => {
      gsap.to(el, { scale: 0, duration: 0.4, ease: "expo.in" });
      setActive(-1);
    };
    list.addEventListener("pointermove", move);
    list.addEventListener("pointerenter", enter);
    list.addEventListener("pointerleave", leave);
    return () => {
      list.removeEventListener("pointermove", move);
      list.removeEventListener("pointerenter", enter);
      list.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div className="roster-wrap">
      <ol className="roster" ref={listRef} data-stagger>
        {trainers.map((t, i) => (
          <li
            key={t.slug}
            className={`roster-row${active === i ? " is-active" : ""}`}
            onPointerEnter={() => setActive(i)}
          >
            <span className="roster-no">{String(i + 1).padStart(2, "0")}</span>
            <div className="roster-main">
              <h3 className="roster-name">
                <Link href={trainerPath(t)} className="roster-link" data-cursor="Profil">
                  <span className="roster-name-txt" data-text={t.name}>
                    {t.name}
                  </span>
                </Link>
              </h3>
              <div className="roster-meta">
                <span className="roster-gym">{t.gym || "Gym menyusul"}</span>
                {t.gymAddress && (
                  <span className="roster-addr">
                    <PinIcon /> {t.gymAddress}
                  </span>
                )}
                {t.specialties.length > 0 && (
                  <ul className="tags" aria-label="Spesialisasi">
                    {t.specialties.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="roster-actions">
              {t.whatsapp ? (
                <WhatsAppButton href={trainerWhatsappLink(t)} label="Chat" />
              ) : (
                <span className="roster-soon">Kontak segera</span>
              )}
              <span className="roster-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="28" height="28">
                  <path d="M5 19 19 5M8 5h11v11" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </span>
            </div>
          </li>
        ))}
      </ol>

      <div className="jersey" ref={card} aria-hidden="true">
        {trainers.map((t, i) => (
          <div key={t.slug} className={`jersey-face${active === i ? " is-on" : ""}`}>
            <span className="jersey-no">{String(i + 1).padStart(2, "0")}</span>
            {t.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.photo} alt="" className="jersey-photo" loading="lazy" />
            ) : (
              <span className="jersey-initials">{initials(t.name)}</span>
            )}
            <span className="jersey-name">{t.name}</span>
            <span className="jersey-gym">{t.gym || "Perbaungan"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
