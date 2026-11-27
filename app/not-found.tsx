import Link from "next/link";

export default function NotFound() {
  return (
    <section className="hero">
      <h1>Halaman tidak ditemukan</h1>
      <p className="lead">Halaman yang Anda cari tidak ada atau sudah dipindahkan.</p>
      <p>
        <Link href="/">← Lihat daftar personal trainer di Perbaungan</Link>
      </p>
    </section>
  );
}
