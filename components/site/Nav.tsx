"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/motion";
import { Roll } from "./Roll";

const links = [
  { href: "/#trainer", label: "Trainer" },
  { href: "/#kenapa", label: "Kenapa PT" },
  { href: "/#cara", label: "Cara mulai" },
  { href: "/#faq", label: "FAQ" },
];

export function Nav() {
  const ref = useRef<HTMLElement>(null);

  // Sembunyi saat scroll ke bawah, muncul lagi saat scroll ke atas.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate(self) {
        const y = self.scroll();
        el.classList.toggle("is-solid", y > 40);
        el.classList.toggle("is-hidden", self.direction === 1 && y > 320);
      },
    });
    return () => st.kill();
  }, []);

  return (
    <header className="nav" ref={ref}>
      <div className="nav-inner">
        <Link href="/" className="brand" aria-label="Personal Trainer Perbaungan — beranda">
          <span className="brand-mark">PT</span>
          <span className="brand-text">
            Perbaungan<small>Personal Trainer</small>
          </span>
        </Link>
        <nav aria-label="Navigasi utama">
          <ul className="nav-links">
            {links.map((l, i) => (
              <li key={l.href}>
                <Link href={l.href}>
                  <span className="nav-idx">0{i + 1}</span>
                  <Roll text={l.label} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link href="/#trainer" className="btn btn-accent btn-sm" data-magnetic>
          <Roll text="Cari trainer" />
        </Link>
      </div>
    </header>
  );
}
