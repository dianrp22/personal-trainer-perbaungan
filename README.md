# Personal Trainer Perbaungan

Landing page daftar personal trainer di Perbaungan, Serdang Bedagai, Sumatera Utara.
Dibuat dengan Next.js (App Router, TypeScript) sebagai **static export** — tanpa database,
tanpa backend, dan bisa di-host **gratis** di Cloudflare Pages.

## Struktur singkat

```
data/site.ts        → URL, nama situs, title, description, kota, nomor admin
data/trainers.ts    → daftar trainer (edit di sini)
data/faq.ts         → pertanyaan & jawaban FAQ di halaman utama
public/trainers/    → foto trainer
app/page.tsx        → halaman utama (/)
app/trainer/[slug]/ → halaman profil tiap trainer (/trainer/<slug>/)
app/sitemap.ts      → sitemap.xml otomatis
app/robots.ts       → robots.txt otomatis
```

## 1. Edit data trainer & menambah trainer baru

Semua data trainer ada di `data/trainers.ts`. Setiap trainer berbentuk seperti ini:

```ts
{
  slug: "nama-trainer",          // dipakai di URL: /trainer/nama-trainer/
  name: "Nama Trainer",
  gym: "Nama Gym",
  gymAddress: "Jl. ..., Perbaungan, Serdang Bedagai",
  whatsapp: "628123456789",      // format 62xxx, tanpa +, spasi, atau 0 di depan
  photo: "/trainers/nama-trainer.jpg",
  specialties: ["Fat loss", "Muscle gain"],
  bio: "Personal trainer di Nama Gym Perbaungan. Hubungi langsung lewat WhatsApp untuk konsultasi program, jadwal, dan biaya.",
  mapsUrl: "https://maps.app.goo.gl/xxxx",
  instagram: "https://www.instagram.com/namaakun/",
},
```

**Menambah trainer baru:** salin satu blok `{ ... },` di atas, tempel di dalam array
`trainers`, lalu isi datanya. Halaman profil, sitemap, dan data terstruktur (JSON-LD)
ikut terbuat otomatis.

Catatan:
- Field yang dikosongkan (`""` atau `[]`) **tidak ditampilkan** di halaman. Kalau `whatsapp`
  kosong, tombol WhatsApp tidak muncul.
- **Foto:** simpan file di `public/trainers/` (mis. `public/trainers/yusrizal.jpg`), lalu isi
  `photo: "/trainers/yusrizal.jpg"`. Pakai foto persegi, sekitar 400×400 px, dan kompres dulu
  (mis. di squoosh.app) supaya situs tetap cepat. Kalau `photo` kosong, yang tampil inisial nama.
- **Slug** sebaiknya tidak diubah setelah halaman terindeks Google, karena URL-nya akan berubah.
- Jangan mencantumkan harga, testimoni, rating, atau sertifikasi yang belum dikonfirmasi
  langsung oleh trainer.
- **Nomor admin (opsional):** isi `adminWhatsapp` di `data/site.ts` untuk memunculkan section
  "Anda personal trainer di Perbaungan?" di halaman utama.

## 2. Menjalankan di komputer sendiri

Butuh Node.js 18.18 atau lebih baru (disarankan Node 20+).

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

Untuk mengecek hasil build final:

```bash
npm run build
```

Hasilnya ada di folder `out/` (HTML statis).

## 3. Deploy gratis ke Cloudflare Pages lewat GitHub

1. Buat repository baru di GitHub, lalu push proyek ini:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<username>/personal-trainer-perbaungan.git
   git push -u origin main
   ```
2. Login ke https://dash.cloudflare.com → **Workers & Pages** → **Create** → tab **Pages** →
   **Connect to Git**, lalu pilih repository tadi.
3. Isi pengaturan build:
   - **Project name:** `personaltrainerperbaungan` (ini menentukan alamat
     `personaltrainerperbaungan.pages.dev`)
   - **Framework preset:** Next.js (Static HTML Export) — atau `None`
   - **Build command:** `npm run build`
   - **Build output directory:** `out`
   - (Opsional) **Environment variable:** `NODE_VERSION` = `20`
4. Klik **Save and Deploy**. Setiap kali Anda push ke GitHub, Cloudflare otomatis build ulang.

## 4. Setelah deploy

1. **Cek `url` di `data/site.ts`.** Isinya harus sama persis dengan alamat situs Anda
   (mis. `https://personaltrainerperbaungan.pages.dev`, atau domain sendiri kalau nanti punya).
   Kalau berbeda, ganti, commit, lalu push. URL ini dipakai untuk canonical, sitemap, dan
   JSON-LD.
2. **Daftarkan ke Google Search Console:** buka https://search.google.com/search-console →
   **Add property** → pilih **URL prefix** → masukkan alamat situs. Untuk verifikasi, pilih
   metode **HTML tag**, salin nilai `content`-nya, lalu tambahkan ke `app/layout.tsx`:
   ```ts
   export const metadata: Metadata = {
     // ...
     verification: { google: "KODE_VERIFIKASI_ANDA" },
   };
   ```
   Push, tunggu deploy selesai, lalu klik **Verify**.
3. **Kirim sitemap:** di Search Console → **Sitemaps** → masukkan `sitemap.xml` → **Submit**.
4. **Request indexing:** di Search Console → **URL Inspection** → tempel URL halaman utama →
   **Request indexing**. Ulangi untuk halaman trainer kalau perlu.

Tes data terstruktur di https://search.google.com/test/rich-results.

## 5. Tips SEO lokal

- **Google Maps:** minta tiap trainer (atau pemilik gym) menambahkan link website ini — atau
  link profilnya, mis. `https://personaltrainerperbaungan.pages.dev/trainer/yusrizal/` — di pin
  Google Maps / Google Business Profile mereka.
- **Instagram:** minta trainer memasang link profilnya di bio Instagram.
- Isi lengkap data tiap trainer (foto, spesialisasi, Maps, Instagram). Halaman yang lengkap
  lebih berguna bagi pengunjung dan lebih mudah dinilai relevan oleh Google.
- Jangan membuat banyak halaman dengan isi mirip untuk tiap variasi kata kunci — cukup satu
  halaman utama yang bagus ditambah satu halaman per trainer.
- Hasil SEO butuh waktu, biasanya beberapa minggu sampai situs muncul untuk pencarian lokal.
