import { site } from "@/data/site";
import type { Trainer } from "@/data/trainers";
import { absoluteUrl, trainerPath } from "@/lib/helpers";

function postalAddress(t: Trainer) {
  return {
    "@type": "PostalAddress",
    ...(t.gymAddress ? { streetAddress: t.gymAddress } : {}),
    addressLocality: site.city,
    addressRegion: site.region,
    addressCountry: site.country,
  };
}

/** Lokasi kerja: ExerciseGym kalau nama gym diisi, selain itu Place umum di Perbaungan. */
function workLocation(t: Trainer) {
  if (t.gym) {
    return {
      "@type": "ExerciseGym",
      name: `${t.gym} ${site.city}`,
      address: postalAddress(t),
      ...(t.mapsUrl ? { hasMap: t.mapsUrl } : {}),
    };
  }
  return { "@type": "Place", address: postalAddress(t) };
}

export function personSchema(t: Trainer) {
  return {
    "@type": "Person",
    "@id": `${absoluteUrl(trainerPath(t))}#person`,
    name: t.name,
    jobTitle: "Personal Trainer",
    url: absoluteUrl(trainerPath(t)),
    ...(t.bio ? { description: t.bio } : {}),
    ...(t.photo ? { image: absoluteUrl(t.photo) } : {}),
    ...(t.whatsapp ? { telephone: `+${t.whatsapp}` } : {}),
    ...(t.specialties.length ? { knowsAbout: t.specialties } : {}),
    ...(t.instagram ? { sameAs: [t.instagram] } : {}),
    workLocation: workLocation(t),
  };
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Escape "<" supaya aman di dalam tag script.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
