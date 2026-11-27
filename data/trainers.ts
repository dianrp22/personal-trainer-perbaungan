// Daftar personal trainer. Field yang dikosongkan ("" atau []) tidak ditampilkan di halaman.
// JANGAN mengisi data yang belum dikonfirmasi trainer (harga, sertifikasi, testimoni, dll).

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
  specialties: string[];
  bio: string;
  /** Link Google Maps gym/trainer, misalnya "https://maps.app.goo.gl/xxxx". */
  mapsUrl: string;
  /** URL lengkap Instagram, misalnya "https://www.instagram.com/namaakun/". */
  instagram: string;
};

export const trainers: Trainer[] = [
  {
    slug: "yusrizal",
    name: "Yusrizal",
    gym: "FitCube",
    gymAddress:
      "Jl. Lintas Sumatera, Kota Galuh (sebelah Titik Temu Sergai), Perbaungan, Serdang Bedagai",
    whatsapp: "6289527345301",
    photo: "", // TODO: taruh foto di public/trainers/yusrizal.jpg lalu isi "/trainers/yusrizal.jpg"
    specialties: [], // TODO: isi sesuai konfirmasi trainer, mis. ["Fat loss", "Muscle gain"]
    bio: "Personal trainer di FitCube Perbaungan. Hubungi langsung lewat WhatsApp untuk konsultasi program, jadwal, dan biaya.",
    mapsUrl: "", // TODO: link Google Maps FitCube Perbaungan
    instagram: "", // TODO: URL Instagram Yusrizal (kalau ada)
  },
  {
    slug: "nurmala-sari",
    name: "Nurmala Sari",
    gym: "", // TODO: nama gym
    gymAddress: "", // TODO: alamat gym
    whatsapp: "", // TODO: nomor WhatsApp format 62xxx
    photo: "", // TODO: taruh foto di public/trainers/nurmala-sari.jpg lalu isi "/trainers/nurmala-sari.jpg"
    specialties: [], // TODO: spesialisasi sesuai konfirmasi trainer
    // TODO: setelah gym & WhatsApp diisi, ubah jadi mis. "Personal trainer di [gym] Perbaungan. Hubungi langsung lewat WhatsApp untuk konsultasi program, jadwal, dan biaya."
    bio: "Personal trainer di Perbaungan, Serdang Bedagai.",
    mapsUrl: "", // TODO: link Google Maps gym
    instagram: "", // TODO: URL Instagram (kalau ada)
  },
];

export function getTrainer(slug: string): Trainer | undefined {
  return trainers.find((t) => t.slug === slug);
}
