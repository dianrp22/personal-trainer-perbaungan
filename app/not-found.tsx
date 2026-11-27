import Link from "next/link";
import { ArrowIcon } from "@/components/site/Icons";
import { Roll } from "@/components/site/Roll";

export default function NotFound() {
  return (
    <section className="nf">
      <p className="mono nf-tag" data-reveal data-load>
        <span className="live-dot" /> Error 404 · Keluar lintasan
      </p>
      <p className="nf-code" data-scatter aria-hidden="true">
        404
      </p>
      <h1 className="nf-title" data-split="lines" data-load data-delay="0.2">
        Halaman tidak ditemukan
      </h1>
      <p className="nf-lead" data-reveal data-load data-delay="0.4">
        Halaman yang Anda cari tidak ada atau sudah dipindahkan.
      </p>
      <Link href="/#trainer" className="btn btn-accent btn-lg" data-magnetic data-reveal data-load data-delay="0.5">
        <Roll text="Lihat daftar personal trainer di Perbaungan" />
        <ArrowIcon />
      </Link>
    </section>
  );
}
