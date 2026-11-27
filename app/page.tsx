import type { Metadata } from "next";
import { site } from "@/data/site";
import { trainers } from "@/data/trainers";
import { faqs } from "@/data/faq";
import { TrainerCard } from "@/components/TrainerCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { JsonLd, personSchema } from "@/lib/jsonld";
import { absoluteUrl, trainerPath, whatsappLink } from "@/lib/helpers";

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

  return (
    <>
      <JsonLd data={jsonLd} />

      <section className="hero">
        <h1>Personal Trainer di Perbaungan</h1>
        <p className="lead">
          Mencari personal trainer di Perbaungan? Halaman ini berisi daftar personal trainer (PT)
          yang melatih di gym sekitar Perbaungan, Kabupaten Serdang Bedagai. Lihat gym dan
          alamatnya, lalu hubungi trainer langsung lewat WhatsApp untuk menanyakan program, jadwal,
          dan biaya.
        </p>
      </section>

      <section aria-labelledby="daftar">
        <h2 id="daftar">Daftar PT di Perbaungan</h2>
        <div className="grid">
          {trainers.map((t, i) => (
            <TrainerCard key={t.slug} trainer={t} eager={i < 2} />
          ))}
        </div>
      </section>

      <section aria-labelledby="kenapa">
        <h2 id="kenapa">Kenapa pakai personal trainer?</h2>
        <p>
          Pelatih fitness pribadi membantu Anda berlatih dengan arah yang jelas, terutama kalau baru
          mulai atau sudah lama tidak olahraga.
        </p>
        <ul className="benefits">
          {benefits.map((b) => (
            <li key={b.title}>
              <strong>{b.title}.</strong> {b.text}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="faq">
        <h2 id="faq">Pertanyaan seputar personal trainer di Perbaungan</h2>
        <div className="faq">
          {faqs.map((f) => (
            <details key={f.question}>
              <summary>
                <h3>{f.question}</h3>
              </summary>
              <p>{f.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {site.adminWhatsapp && (
        <section className="cta" aria-labelledby="daftarkan">
          <h2 id="daftarkan">Anda personal trainer di Perbaungan?</h2>
          <p>
            Ingin profil Anda tampil di daftar ini? Hubungi admin lewat WhatsApp dengan nama, gym,
            dan nomor WhatsApp Anda.
          </p>
          <WhatsAppButton
            label="Hubungi admin"
            href={whatsappLink(
              site.adminWhatsapp,
              `Halo admin ${site.name}, saya personal trainer di Perbaungan dan ingin didaftarkan di website.`
            )}
          />
        </section>
      )}
    </>
  );
}
