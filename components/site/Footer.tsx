import Link from "next/link";
import { site } from "@/data/site";
import { TrackOval } from "@/components/motion/TrackOval";
import { ArrowIcon } from "./Icons";
import { Roll } from "./Roll";

const links = [
  { href: "/#trainer", label: "Trainer" },
  { href: "/#kenapa", label: "Kenapa PT" },
  { href: "/#cara", label: "Cara mulai" },
  { href: "/#faq", label: "FAQ" },
];

export function Footer() {
  return (
    <footer className="footer">
      <TrackOval />

      <div className="container footer-cta">
        <p className="sec-idx mono" data-reveal>
          <span className="live-dot" /> Garis finish
        </p>
        <p className="footer-title" data-split="chars">
          Siap mulai <em>latihan?</em>
        </p>
        <div className="footer-row" data-reveal>
          <p>Pilih trainer, chat lewat WhatsApp, sepakati jadwal. Selebihnya urusan keringat Anda.</p>
          <Link href="/#trainer" className="btn btn-xl btn-accent" data-magnetic>
            <Roll text="Pilih trainer" />
            <ArrowIcon />
          </Link>
        </div>
      </div>

      <nav className="container footer-nav" aria-label="Navigasi footer">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="mono">
            <span data-scramble>{l.label}</span>
          </Link>
        ))}
        <a href="#top" className="mono">
          <span data-scramble>Kembali ke atas</span> <ArrowIcon dir="up" />
        </a>
      </nav>

      <p className="footer-word" aria-hidden="true" data-split="chars">
        Perbaungan
      </p>

      <div className="container footer-bottom mono">
        <p>
          © {new Date().getFullYear()} {site.name} · {site.city}, {site.regency}, {site.region}
        </p>
        <p>Informasi biaya dan jadwal bisa berubah. Selalu konfirmasi langsung ke trainer.</p>
      </div>
    </footer>
  );
}
