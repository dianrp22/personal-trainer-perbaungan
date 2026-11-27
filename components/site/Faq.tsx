"use client";

import { useId, useRef, useState } from "react";
import { gsap } from "@/lib/motion";

/** Akordeon FAQ. Jawaban selalu ada di HTML (terbaca Google), tingginya dianimasikan. */
export function Faq({ items }: { items: { question: string; answer: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const id = useId();

  const toggle = (i: number) => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const prev = open;
    const next = open === i ? null : i;
    setOpen(next);
    const anim = (el: HTMLDivElement | null, show: boolean) => {
      if (!el) return;
      if (reduced) {
        gsap.set(el, { height: show ? "auto" : 0 });
        return;
      }
      // Ukur sekarang (sebelum React mengganti class) supaya tidak ada lompatan.
      gsap.fromTo(
        el,
        { height: el.offsetHeight },
        {
          height: show ? el.scrollHeight : 0,
          duration: 0.7,
          ease: "expo.inOut",
          overwrite: true,
          onComplete: () => {
            if (show) gsap.set(el, { height: "auto" });
          },
        }
      );
    };
    if (prev !== null && prev !== next) anim(panels.current[prev], false);
    if (next !== null) anim(panels.current[next], true);
  };

  return (
    <div className="faq" data-stagger>
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.question} className={`faq-item${isOpen ? " is-open" : ""}`}>
            <h3 className="faq-q">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${id}-${i}`}
                onClick={() => toggle(i)}
              >
                <span className="faq-no">{String(i + 1).padStart(2, "0")}</span>
                <span className="faq-text">{f.question}</span>
                <span className="faq-icon" aria-hidden="true" />
              </button>
            </h3>
            <div
              id={`${id}-${i}`}
              role="region"
              className="faq-a"
              ref={(el) => {
                panels.current[i] = el;
              }}
            >
              <p>{f.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
