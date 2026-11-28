import { site } from "@/data/site";
import type { Trainer } from "@/data/trainers";

/** Link wa.me dengan pesan pembuka otomatis. */
export function whatsappLink(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function trainerWhatsappLink(t: Trainer): string {
  return whatsappLink(
    t.whatsapp,
    `Halo ${t.name}, saya lihat profil Anda di website ${site.name}. Saya ingin tanya tentang program personal training, jadwal, dan biayanya.`
  );
}

/** "6289527345301" → "+62 895-2734-5301" (untuk ditampilkan). */
export function formatPhone(number: string): string {
  const d = number.replace(/\D/g, "");
  if (!d.startsWith("62")) return d;
  const rest = d.slice(2);
  return `+62 ${[rest.slice(0, 3), rest.slice(3, 7), rest.slice(7)].filter(Boolean).join("-")}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export function trainerPath(t: Trainer): string {
  return `/trainer/${t.slug}/`;
}

export function absoluteUrl(path: string): string {
  return `${site.url}${path}`;
}
