import type { Metadata } from "next";
import { existsSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { site } from "@/data/site";
import { trainers } from "@/data/trainers";
import { faqs } from "@/data/faq";
import { HeroCrew, type CrewCard } from "@/components/motion/HeroCrew";
import { VideoCrew } from "@/components/motion/VideoCrew";
import { HeroFilm } from "@/components/motion/HeroFilm";
import { Marquee } from "@/components/motion/Marquee";
import { PulseTrace } from "@/components/motion/PulseTrace";
import { Stopwatch } from "@/components/motion/Stopwatch";
import { Faq } from "@/components/site/Faq";
import { Fab } from "@/components/site/Fab";
import { ArrowIcon } from "@/components/site/Icons";
import { Roll } from "@/components/site/Roll";
import { Roster } from "@/components/site/Roster";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { JsonLd, personSchema } from "@/lib/jsonld";
import { absoluteUrl, trainerPath, trainerWhatsappLink, whatsappLink } from "@/lib/helpers";

export function generateMetadata(): Metadata {
  return {
    title: { absolute: site.title },
    description: site.description,
    alternates: { canonical: "/" },
    openGraph: {
      title: site.title,
      description: site.description,
      url: "/",
      locale: site.locale,
      siteName: site.name,
      type: "website",
    },
  };
}

const benefits = [
  {
    title: "Teknik lebih aman",
    text: "Trainer memperhatikan postur dan gerakan Anda, sehingga risiko salah gerakan bisa dikurangi.",
  },
  {
    title: "Program sesuai target",
    text: "Latihan disusun sesuai tujuan Anda, misalnya menurunkan berat badan, menambah massa otot, atau sekadar lebih bugar.",
  },
  {
    title: "Lebih konsisten",
    text: "Jadwal tetap dan ada yang memantau progres membuat latihan lebih mudah dijalani rutin.",
  },
  {
    title: "Waktu lebih efisien",
    text: "Tidak perlu menebak-nebak harus latihan apa. Datang ke gym, ikuti program, selesai.",
  },
];

const steps = [
  { title: "Pilih trainer", text: "Lihat daftar di atas, lalu pilih trainer yang gym-nya paling dekat dengan Anda." },
  { title: "Chat WhatsApp", text: "Tekan tombol Chat. Pesan pembuka sudah terisi, tinggal kirim." },
  {
    title: "Konsultasi",
    text: "Ceritakan target dan riwayat cedera. Tanyakan jadwal, jumlah sesi, dan biayanya.",
  },
  { title: "Mulai latihan", text: "Datang ke gym sesuai jadwal yang disepakati. Selebihnya: konsisten." },
];

/** File di public/ dengan nama sama tapi ekstensi lain, kalau ada (dicek saat build). */
function sibling(file: string, ext: string) {
  if (!file) return "";
  const alt = file.replace(/\.[a-z0-9]+$/i, ext);
  return alt !== file && existsSync(join(process.cwd(), "public", alt)) ? alt : "";
}

/** Kartu/figur di hero: dua trainer pertama, masing-masing dengan kalimat & tombol WA-nya. */
function crewCards(list = trainers.slice(0, 2)): CrewCard[] {
  // Wajah & video contoh khusus preview lokal (lihat .env.local); tidak dipakai saat deploy.
  let demo = process.env.NEXT_PUBLIC_DEMO_FACE || "";
  let demoVideo = process.env.NEXT_PUBLIC_DEMO_VIDEO || "";
  return list.map((t) => {
    const firstName = t.name.split(/\s+/)[0]!;
    let face = t.heroFace;
    let video = t.heroVideo;
    if (!face && demo && t.figure === "pria") {
      face = demo;
      demo = "";
    }
    if (!video && demoVideo && t.figure === "pria") {
      video = demoVideo;
      demoVideo = "";
    }
    return {
      name: t.name,
      firstName,
      kind: t.figure,
      face,
      wa: t.whatsapp ? trainerWhatsappLink(t) : "",
      profile: trainerPath(t),
      video,
      videoWebm: sibling(video, ".webm"),
      poster: sibling(video, ".jpg") || t.photo || face,
      lines: [
        `Halo! Saya ${firstName}.`,
        t.gym ? `Saya melatih di ${t.gym}, ${site.city}.` : `Personal trainer di ${site.city}.`,
        t.whatsapp ? "Mau mulai latihan? Chat saya aja." : "Kontak saya segera ditambahkan.",
      ],
    };
  });
}

/** Data hero mode "film": satu video besar + daftar trainer yang tampil di dalamnya. */
function filmProps() {
  const cards = crewCards(trainers);
  const video = site.heroFilm.video || process.env.NEXT_PUBLIC_DEMO_FILM || "";
  const people = site.heroFilm.people
    .map(({ slug, label }) => {
      const i = trainers.findIndex((t) => t.slug === slug);
      return i >= 0 && cards[i] ? { ...cards[i]!, label } : null;
    })
    .filter((p): p is NonNullable<typeof p> => !!p);
  return { video, videoWebm: sibling(video, ".webm"), poster: sibling(video, ".jpg"), people };
}

const tape = ["Fat loss", "Muscle gain", "Kekuatan", "Kebugaran", "Pemula", "Postur", "Stamina", "Konsisten"];

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: `Daftar Personal Trainer di ${site.city}`,
        url: absoluteUrl("/"),
        numberOfItems: trainers.length,
        itemListElement: trainers.map((t, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: absoluteUrl(trainerPath(t)),
          item: personSchema(t),
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };

  const count = String(trainers.length).padStart(2, "0");
  const film = filmProps();

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* 00 — HERO (sticky; section berikutnya menimpanya) */}
      <section className="hero" data-stack aria-labelledby="judul">
        <div className="stack-inner">
          {site.heroMode === "film" && film.video ? (
            <HeroFilm {...film} />
          ) : site.heroMode === "3d" ? (
            <HeroCrew crew={crewCards()} />
          ) : (
            // Mode "film" tanpa video (belum dibuat) → sementara pakai kartu.
            <VideoCrew crew={crewCards()} />
          )}
          <div className="hero-grid">
            <p className="hero-kicker mono" data-reveal data-load>
              <span className="live-dot" /> Direktori PT · {site.regency}, {site.region}
            </p>
            <h1 className="hero-title" id="judul">
              <span className="ht-row" data-split="chars" data-load data-delay="0.05">
                Personal
              </span>{" "}
              <span className="ht-row ht-outline" data-split="chars" data-load data-delay="0.2">
                Trainer
              </span>{" "}
              <span className="ht-row" data-split="chars" data-load data-delay="0.35">
                di <em>Perbaungan</em>
              </span>
            </h1>
            <div className="hero-foot">
              <p className="hero-lead" data-reveal data-load data-delay="0.7">
                Mencari personal trainer di Perbaungan? Halaman ini berisi daftar personal trainer (PT)
                yang melatih di gym sekitar Perbaungan, Kabupaten Serdang Bedagai. Lihat gym dan
                alamatnya, lalu hubungi trainer langsung lewat WhatsApp untuk menanyakan program,
                jadwal, dan biaya.
              </p>
              <div className="hero-side" data-reveal data-load data-delay="0.85">
                <Stopwatch />
                <Link href="#trainer" className="btn btn-accent btn-lg" data-magnetic>
                  <Roll text="Lihat daftar trainer" />
                  <ArrowIcon dir="down" />
                </Link>
              </div>
            </div>
          </div>
          <span className="hero-scroll mono" aria-hidden="true">
            Scroll <i />
          </span>
          <div className="stack-shade" aria-hidden="true" />
        </div>
      </section>

      <div className="over">
        <div className="tapes" aria-hidden="true">
          <Marquee items={tape} className="tape tape-a" />
          <Marquee items={tape} className="tape tape-b" reverse duration={34} />
        </div>

        {/* 01 — DAFTAR TRAINER */}
        <section id="trainer" className="sec sec-light" aria-labelledby="daftar">
          <div className="container">
            <header className="sec-head">
              <span className="sec-idx mono" data-reveal>
                01 / Squad
              </span>
              <h2 id="daftar" className="sec-title" data-split="lines">
                Daftar PT di Perbaungan
              </h2>
              <p className="sec-aside" data-reveal data-delay="0.15">
                <b className="sec-count" data-count>
                  {count}
                </b>
                trainer terdaftar. Klik nama untuk melihat profil, atau langsung chat lewat WhatsApp.
              </p>
            </header>
            <Roster trainers={trainers} />
          </div>
        </section>

        {/* 02 — KENAPA (horizontal, di-pin di desktop) */}
        <section id="kenapa" className="rounds" data-horizontal aria-labelledby="kenapa-judul">
          <div className="rounds-track" data-horizontal-track>
            <div className="rounds-intro">
              <span className="sec-idx mono" data-reveal>
                02 / Kenapa
              </span>
              <h2 id="kenapa-judul" className="sec-title" data-split="lines">
                Kenapa pakai personal trainer?
              </h2>
              <p data-reveal data-delay="0.1">
                Pelatih fitness pribadi membantu Anda berlatih dengan arah yang jelas, terutama kalau
                baru mulai atau sudah lama tidak olahraga.
              </p>
              <span className="rounds-hint mono" aria-hidden="true">
                Terus scroll <ArrowIcon />
              </span>
            </div>
            {benefits.map((b, i) => (
              <article key={b.title} className="round" data-horizontal-item>
                <span className="round-tag mono">
                  Round {i + 1}/{benefits.length}
                </span>
                <span className="round-no" data-scatter aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </article>
            ))}
          </div>
          <div className="rounds-progress" aria-hidden="true">
            <i data-horizontal-progress />
          </div>
        </section>

        {/* 03 — CARA MULAI */}
        <section id="cara" className="sec sec-dark" aria-labelledby="cara-judul">
          <div className="container">
            <header className="sec-head">
              <span className="sec-idx mono" data-reveal>
                03 / Cara mulai
              </span>
              <h2 id="cara-judul" className="sec-title" data-split="lines">
                Dari chat ke latihan pertama
              </h2>
              <p className="sec-aside" data-reveal data-delay="0.15">
                Empat langkah. Tanpa daftar akun, tanpa biaya untuk memakai situs ini.
              </p>
            </header>
            <PulseTrace steps={steps} />
            <dl className="board" data-stagger>
              <div>
                <dt className="mono">Trainer terdaftar</dt>
                <dd data-count>{count}</dd>
              </div>
              <div>
                <dt className="mono">Biaya pakai situs</dt>
                <dd>
                  Rp<span>0</span>
                </dd>
              </div>
              <div>
                <dt className="mono">Langkah sampai latihan</dt>
                <dd data-count>{String(steps.length).padStart(2, "0")}</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* 04 — FAQ */}
        <section id="faq" className="sec sec-light" aria-labelledby="faq-judul">
          <div className="container faq-grid">
            <header className="sec-head sec-head-stack">
              <span className="sec-idx mono" data-reveal>
                04 / FAQ
              </span>
              <h2 id="faq-judul" className="sec-title sec-title-sm" data-split="lines">
                Pertanyaan seputar personal trainer di Perbaungan
              </h2>
            </header>
            <Faq items={faqs} />
          </div>
        </section>

        {site.adminWhatsapp && (
          <section className="sec sec-accent cta" aria-labelledby="daftarkan">
            <div className="container cta-inner">
              <h2 id="daftarkan" className="sec-title" data-split="lines">
                Anda personal trainer di Perbaungan?
              </h2>
              <div data-reveal>
                <p>
                  Ingin profil Anda tampil di daftar ini? Hubungi admin lewat WhatsApp dengan nama,
                  gym, dan nomor WhatsApp Anda.
                </p>
                <WhatsAppButton
                  label="Hubungi admin"
                  className="btn-dark"
                  href={whatsappLink(
                    site.adminWhatsapp,
                    `Halo admin ${site.name}, saya personal trainer di Perbaungan dan ingin didaftarkan di website.`
                  )}
                />
              </div>
            </div>
          </section>
        )}
      </div>

      <Fab />
    </>
  );
}
