import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/data/site";
import { getTrainer, trainers, type Trainer } from "@/data/trainers";
import { Marquee } from "@/components/motion/Marquee";
import { ArrowIcon, PinIcon } from "@/components/site/Icons";
import { Roll } from "@/components/site/Roll";
import { TrainerMedia } from "@/components/site/TrainerMedia";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
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

  const index = trainers.findIndex((x) => x.slug === t.slug);
  const no = String(index + 1).padStart(2, "0");
  const next = trainers.length > 1 ? trainers[(index + 1) % trainers.length] : undefined;

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", ...personSchema(t) }} />

      <article className="profile">
        <section className="p-hero">
          <span className="p-bignum" aria-hidden="true" data-parallax="-0.25">
            {no}
          </span>
          <div className="container">
            <nav className="crumb mono" data-reveal data-load>
              <Link href="/#trainer">
                <ArrowIcon dir="left" /> Semua personal trainer di Perbaungan
              </Link>
            </nav>

            <div className="p-grid">
              <div className="p-media" data-reveal data-load data-delay="0.15">
                <TrainerMedia trainer={t} eager />
                <span className="p-jersey mono">#{no}</span>
              </div>

              <div className="p-info">
                <p className="p-role mono" data-reveal data-load data-delay="0.1">
                  <span className="live-dot" /> Personal Trainer di {site.city}
                  {t.gym && ` · ${t.gym}`}
                </p>
                <h1 className="p-name" data-split="chars" data-load data-delay="0.2">
                  {t.name}
                </h1>
                {t.bio && (
                  <p className="p-bio" data-reveal data-load data-delay="0.55">
                    {t.bio}
                  </p>
                )}
                <div className="p-actions" data-reveal data-load data-delay="0.7">
                  {t.whatsapp && <WhatsAppButton href={trainerWhatsappLink(t)} className="btn-lg" />}
                  {t.mapsUrl && (
                    <a className="btn btn-ghost" href={t.mapsUrl} target="_blank" rel="noopener noreferrer" data-magnetic>
                      <Roll text="Buka Google Maps" />
                    </a>
                  )}
                  {t.instagram && (
                    <a className="btn btn-ghost" href={t.instagram} target="_blank" rel="noopener noreferrer" data-magnetic>
                      <Roll text="Instagram" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <Marquee
          items={[t.name, "Personal Trainer", t.gym || site.city, site.city]}
          className="tape tape-a tape-flat"
        />

        <section className="sec sec-light p-sheet-sec">
          <div className="container">
            <span className="sec-idx mono" data-reveal>
              Lembar data
            </span>
            <dl className="sheet" data-stagger>
              <div>
                <dt className="mono">Nama</dt>
                <dd>{t.name}</dd>
              </div>
              {t.gym && (
                <div>
                  <dt className="mono">Gym</dt>
                  <dd>{t.gym}</dd>
                </div>
              )}
              {t.gymAddress && (
                <div>
                  <dt className="mono">Alamat</dt>
                  <dd>
                    <PinIcon /> {t.gymAddress}
                  </dd>
                </div>
              )}
              {t.specialties.length > 0 && (
                <div>
                  <dt className="mono">Spesialisasi</dt>
                  <dd>
                    <ul className="tags">
                      {t.specialties.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
              <div>
                <dt className="mono">Kontak</dt>
                <dd>{t.whatsapp ? "WhatsApp (tombol di atas)" : "Segera ditambahkan"}</dd>
              </div>
            </dl>
            <p className="back" data-reveal>
              <Link href="/#trainer">
                <ArrowIcon dir="left" /> Kembali ke daftar personal trainer Perbaungan
              </Link>
            </p>
          </div>
        </section>

        {next && (
          <Link href={trainerPath(next)} className="next-up" data-cursor="Lanjut">
            <span className="mono">Trainer berikutnya</span>
            <span className="next-name">
              <Roll text={next.name} />
            </span>
            <span className="next-arrow" aria-hidden="true">
              <ArrowIcon />
            </span>
          </Link>
        )}
      </article>
    </>
  );
}
