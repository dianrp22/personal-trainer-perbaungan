"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "@/lib/motion";
import { ArrowIcon } from "./Icons";

/** Galeri foto trainer + lightbox (klik foto untuk memperbesar, panah/Esc di keyboard). */
export function Gallery({ name, photos }: { name: string; photos: string[] }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const total = photos.length;
  const pad = (n: number) => String(n).padStart(2, "0");

  const open = (i: number) => {
    setIndex(i);
    dlg.current?.showModal();
    motion.lenis?.stop();
  };
  const step = useCallback((d: number) => setIndex((i) => (i + d + total) % total), [total]);

  useEffect(() => {
    const el = dlg.current;
    if (!el) return;
    const onClose = () => motion.lenis?.start();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    el.addEventListener("close", onClose);
    el.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("close", onClose);
      el.removeEventListener("keydown", onKey);
    };
  }, [step]);

  if (!total) return null;

  return (
    <>
      <ul className="gallery" data-stagger>
        {photos.map((src, i) => (
          <li key={src}>
            <button type="button" className="g-item" data-cursor="Lihat" onClick={() => open(i)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Foto ${name} ${i + 1} dari ${total}`} loading="lazy" decoding="async" />
              <span className="g-no mono" aria-hidden="true">
                {pad(i + 1)}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dlg}
        className="lightbox"
        aria-label={`Foto ${name}`}
        onClick={(e) => {
          // Klik di luar foto menutup lightbox.
          if (e.target === e.currentTarget) dlg.current?.close();
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="lb-img" src={photos[index]} alt={`Foto ${name} ${index + 1} dari ${total}`} />
        <p className="lb-count mono">
          {pad(index + 1)} / {pad(total)}
        </p>
        <button type="button" className="lb-btn lb-close" onClick={() => dlg.current?.close()} aria-label="Tutup">
          ✕
        </button>
        {total > 1 && (
          <>
            <button type="button" className="lb-btn lb-prev" onClick={() => step(-1)} aria-label="Foto sebelumnya">
              <ArrowIcon dir="left" />
            </button>
            <button type="button" className="lb-btn lb-next" onClick={() => step(1)} aria-label="Foto berikutnya">
              <ArrowIcon />
            </button>
          </>
        )}
      </dialog>
    </>
  );
}
