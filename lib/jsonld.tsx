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
    ...(t.about.length || t.bio ? { description: t.about.length ? t.about.join(" ") : t.bio } : {}),
    ...(t.photo || t.gallery.length
      ? { image: [t.photo, ...t.gallery].filter(Boolean).map((src) => absoluteUrl(src)) }
      : {}),
    ...(t.whatsapp ? { telephone: `+${t.whatsapp}` } : {}),
    ...(t.whatsapp && t.hours
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            telephone: `+${t.whatsapp}`,
            availableLanguage: "id",
            hoursAvailable: {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
              opens: t.hours.opens,
              closes: t.hours.closes,
            },
          },
        }
      : {}),
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
