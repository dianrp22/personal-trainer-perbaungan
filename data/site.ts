// Data utama situs. Edit di sini, semua halaman ikut berubah.

export const site = {
  // TODO: ganti dengan alamat final setelah deploy (tanpa garis miring di akhir),
  // misalnya domain sendiri kalau nanti punya.
  url: "https://personal-trainer-perbaungan.vercel.app",
  name: "Personal Trainer Perbaungan",
  title: "Personal Trainer di Perbaungan – Daftar PT & Gym Terbaru 2026",
  description:
    "Daftar personal trainer dan pelatih fitness di Perbaungan, Serdang Bedagai. Lihat gym dan alamatnya, lalu hubungi PT langsung lewat WhatsApp untuk tanya program, jadwal, dan biaya.",
  city: "Perbaungan",
  regency: "Serdang Bedagai",
  region: "Sumatera Utara",
  country: "ID",
  locale: "id_ID",
  // Gambar preview saat link dibagikan (WhatsApp, Facebook, Google). 1200×630.
  ogImage: "/og.jpg",
  // Verifikasi Google Search Console (metode HTML tag). Jangan dihapus.
  googleVerification: "b4re-nR79VIJR4KhT8QbxTr9yoxC-5y-LtbRxtqA9SQ",
  // TODO (opsional): nomor WhatsApp admin, format 62xxx. Kalau diisi, muncul
  // section "Daftarkan diri Anda" untuk trainer yang ingin dicantumkan.
  adminWhatsapp: "",
  // Tampilan hero halaman utama:
  //   "film"  → satu video besar sebagai latar (isi `heroFilm` di bawah)
  //   "video" → kartu video tiap trainer (isi `heroVideo` di data/trainers.ts)
  //   "3d"    → figur 3D berjalan dengan kepala dari `heroFace`
  heroMode: "film" as "film" | "video" | "3d",
  // Mode "film": video lebar 16:9 di public/, mis. "/hero/hero.mp4". Kalau ada file
  // bernama sama berakhiran .webm / .jpg, otomatis dipakai sebagai versi ringan / poster.
  // `people`: trainer yang tampil di video + label aktivitasnya (urut kiri → kanan).
  heroFilm: {
    // TODO: ganti dengan video asli Yusrizal & Nurmala (sekarang masih dummy).
    video: "/hero/film.mp4",
    people: [
      { slug: "yusrizal", label: "Selesai boxing" },
      { slug: "nurmala-sari", label: "Selesai squat" },
    ],
  },
};
