// Daftar personal trainer. Field yang dikosongkan ("" atau []) tidak ditampilkan di halaman.
// JANGAN mengisi data yang belum dikonfirmasi trainer (harga, sertifikasi, testimoni, dll).

export type FigureKind = "pria" | "wanita";

export type Trainer = {
  /** Dipakai di URL: /trainer/<slug>/ — huruf kecil, pakai tanda hubung, jangan diubah setelah terindeks Google. */
  slug: string;
  name: string;
  /** Nama gym tempat trainer melatih. */
  gym: string;
  gymAddress: string;
  /** Nomor WhatsApp format 62xxx (tanpa +, spasi, atau 0 di depan). */
  whatsapp: string;
  /** Path foto di folder public, misalnya "/trainers/yusrizal.jpg". */
  photo: string;
  /** Foto-foto tambahan untuk galeri di halaman profil (urut tampil). */
  gallery: string[];
  specialties: string[];
  /** Ringkasan singkat di bagian atas halaman profil (1–2 kalimat). */
  bio: string;
  /** Deskripsi lengkap di halaman profil, per paragraf. Isi hanya fakta yang sudah dikonfirmasi trainer. */
  about: string[];
  /** Jam melatih. Kosongkan (null) kalau belum ada. */
  hours: { label: string; opens: string; closes: string } | null;
  /** Link Google Maps gym/trainer, misalnya "https://maps.app.goo.gl/xxxx". */
  mapsUrl: string;
  /** URL lengkap Instagram, misalnya "https://www.instagram.com/namaakun/". */
  instagram: string;
  /** Bentuk badan figur 3D di hero halaman utama. */
  figure: FigureKind;
  /**
   * Foto wajah untuk kepala figur 3D di hero, mis. "/trainers/yusrizal-wajah.jpg".
   * Foto persegi, wajah lurus menghadap kamera, latar polos abu-abu/putih. Wajib izin trainer.
   * Kosongkan ("") untuk kepala polos.
   */
  heroFace: string;
  /**
   * Video untuk kartu di hero (mode "video"), mis. "/trainers/yusrizal-hero.mp4".
   * Vertikal 4:5 atau 9:16, 5–8 detik, bisa di-loop, < 4 MB. Wajib izin trainer.
   */
  heroVideo: string;
};

export const trainers: Trainer[] = [
  {
    slug: "yusrizal",
    name: "Yusrizal",
    gym: "FitCube",
    gymAddress:
      "Jl. Lintas Sumatera, Kota Galuh (sebelah Titik Temu Sergai), Perbaungan, Serdang Bedagai",
    whatsapp: "6289527345301",
    photo: "/trainers/yusrizal.jpg",
    gallery: ["/trainers/yusrizal-1.jpg", "/trainers/yusrizal-2.jpg", "/trainers/yusrizal-3.jpg", "/trainers/yusrizal-4.jpg"],
    specialties: [], // TODO: isi sesuai konfirmasi trainer, mis. ["Fat loss", "Muscle gain"]
    bio: "Personal trainer di FitCube Perbaungan. Melatih setiap hari pukul 09.00–21.00 WIB. Hubungi langsung lewat WhatsApp untuk konsultasi program, jadwal, dan biaya.",
    about: [
      "Yusrizal adalah personal trainer di FitCube Perbaungan, Jl. Lintas Sumatera, Kota Galuh, tepat di sebelah Titik Temu Sergai. Ia melayani sesi latihan pribadi setiap hari pukul 09.00–21.00 WIB untuk warga Perbaungan dan sekitarnya di Serdang Bedagai.",
      "Berlatih bersama personal trainer membuat program latihan lebih jelas, teknik gerakan lebih benar, dan target lebih terukur, baik untuk menurunkan berat badan, menambah massa otot, maupun menjaga kebugaran. Pemula juga bisa mulai dari nol.",
      "Mau tanya program, jadwal, atau biaya? Chat Yusrizal langsung lewat WhatsApp di +62 895-2734-5301.",
    ],
    hours: { label: "Setiap hari, 09.00–21.00 WIB", opens: "09:00", closes: "21:00" },
    mapsUrl: "", // TODO: link Google Maps profil Yusrizal (setelah terverifikasi)
    instagram: "", // TODO: URL Instagram Yusrizal (kalau ada)
    figure: "pria",
    heroFace: "", // TODO: foto wajah Yusrizal (dengan izinnya), mis. "/trainers/yusrizal-wajah.jpg"
    heroVideo: "", // TODO: video Yusrizal, mis. "/trainers/yusrizal-hero.mp4"
  },
  {
    slug: "nurmala-sari",
    name: "Nurmala Sari",
    gym: "FitCube",
    gymAddress:
      "Jl. Lintas Sumatera, Kota Galuh (sebelah Titik Temu Sergai), Perbaungan, Serdang Bedagai",
    whatsapp: "6285270579192",
    photo: "/trainers/nurmala-sari.jpg",
    gallery: ["/trainers/nurmala-sari-1.jpg", "/trainers/nurmala-sari-2.jpg"],
    specialties: [], // TODO: spesialisasi sesuai konfirmasi trainer
    bio: "Personal trainer perempuan di FitCube Perbaungan. Melatih setiap hari pukul 09.00–21.00 WIB. Hubungi langsung lewat WhatsApp untuk konsultasi program, jadwal, dan biaya.",
    about: [
      "Nurmala Sari adalah personal trainer perempuan di FitCube Perbaungan, Jl. Lintas Sumatera, Kota Galuh, sebelah Titik Temu Sergai. Ia melatih setiap hari pukul 09.00–21.00 WIB dan menjadi pilihan yang pas bagi Anda yang lebih nyaman dilatih oleh trainer perempuan.",
      "Sesi latihan disesuaikan dengan tujuan dan kondisi masing-masing, mulai dari membentuk badan, menurunkan berat badan, sampai membangun kebiasaan olahraga yang konsisten. Cocok juga untuk pemula yang baru mulai ke gym.",
      "Untuk tanya program, jadwal, atau biaya, chat Nurmala Sari langsung lewat WhatsApp di +62 852-7057-9192.",
    ],
    hours: { label: "Setiap hari, 09.00–21.00 WIB", opens: "09:00", closes: "21:00" },
    mapsUrl: "", // TODO: link Google Maps profil Nurmala Sari (setelah terverifikasi)
    instagram: "", // TODO: URL Instagram (kalau ada)
    figure: "wanita",
    heroFace: "", // TODO: foto wajah Nurmala Sari (dengan izinnya)
    heroVideo: "", // TODO: video Nurmala Sari
  },
];

export function getTrainer(slug: string): Trainer | undefined {
  return trainers.find((t) => t.slug === slug);
}
