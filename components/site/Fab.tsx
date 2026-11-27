"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Tombol mengambang "Pilih trainer": muncul setelah hero terlewati, sembunyi lagi
 * saat daftar trainer atau footer sedang terlihat.
 */
export function Fab() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const watch = ["#trainer", ".footer"]
      .map((s) => document.querySelector(s))
      .filter((x): x is Element => !!x);
    const inView = new Set<Element>();
    const update = () => setShow(window.scrollY > window.innerHeight * 0.8 && inView.size === 0);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? inView.add(e.target) : inView.delete(e.target)));
      update();
    });
    watch.forEach((el) => io.observe(el));
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <Link href="/#trainer" className={`fab${show ? " is-on" : ""}`} tabIndex={show ? 0 : -1} aria-hidden={!show}>
      <span className="live-dot" />
      Pilih trainer
    </Link>
  );
}
