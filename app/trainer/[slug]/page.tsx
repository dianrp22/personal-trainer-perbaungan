import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/data/site";
import { getTrainer, trainers, type Trainer } from "@/data/trainers";
import { TrainerAvatar } from "@/components/TrainerAvatar";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { JsonLd, personSchema } from "@/lib/jsonld";
import { trainerPath, trainerWhatsappLink } from "@/lib/helpers";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return trainers.map((t) => ({ slug: t.slug }));
}

function pageTitle(t: Trainer) {
  return `${t.name} – Personal Trainer di ${site.city}${t.gym ? ` (${t.gym})` : ""}`;
}

function pageDescription(t: Trainer) {
  const where = t.gym ? `di ${t.gym} ${site.city}` : `di ${site.city}`;
  const contact = t.whatsapp
    ? "Hubungi langsung lewat WhatsApp untuk tanya program, jadwal, dan biaya."
    : "Lihat profil dan informasi kontaknya.";
  return `${t.name}, personal trainer ${where}, ${site.regency}. ${contact}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = getTrainer(slug);
  if (!t) return {};
  const title = pageTitle(t);
  const description = pageDescription(t);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: trainerPath(t) },
    openGraph: {
      title,
      description,
      url: trainerPath(t),
      locale: site.locale,
      siteName: site.name,
      type: "profile",
      ...(t.photo ? { images: [{ url: t.photo, alt: `Foto ${t.name}` }] } : {}),
    },
  };
}

export default async function TrainerPage({ params }: Props) {
  const { slug } = await params;
  const t = getTrainer(slug);
  if (!t) notFound();

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", ...personSchema(t) }} />

      <nav className="back">
        <Link href="/">← Semua personal trainer di Perbaungan</Link>
      </nav>

      <article className="profile">
        <header className="profile-head">
          <TrainerAvatar trainer={t} size={112} eager />
          <div>
            <h1>{t.name}</h1>
            <p className="profile-role">
              Personal Trainer di {site.city}
              {t.gym && ` · ${t.gym}`}
            </p>
          </div>
        </header>

        {t.bio && <p className="lead">{t.bio}</p>}

        <dl className="details">
          {t.gym && (
            <>
              <dt>Gym</dt>
              <dd>{t.gym}</dd>
            </>
          )}
          {t.gymAddress && (
            <>
              <dt>Alamat</dt>
              <dd>{t.gymAddress}</dd>
            </>
          )}
          {t.specialties.length > 0 && (
            <>
              <dt>Spesialisasi</dt>
              <dd>
                <ul className="tags">
                  {t.specialties.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </dd>
            </>
          )}
        </dl>

        <div className="card-actions">
          {t.whatsapp && <WhatsAppButton href={trainerWhatsappLink(t)} />}
          {t.mapsUrl && (
            <a className="btn btn-outline" href={t.mapsUrl} target="_blank" rel="noopener noreferrer">
              Buka Google Maps
            </a>
          )}
          {t.instagram && (
            <a className="btn btn-outline" href={t.instagram} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          )}
        </div>
      </article>

      <p className="back">
        <Link href="/">← Kembali ke daftar personal trainer Perbaungan</Link>
      </p>
    </>
  );
}
