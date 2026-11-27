import type { MetadataRoute } from "next";
import { trainers } from "@/data/trainers";
import { absoluteUrl, trainerPath } from "@/lib/helpers";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...trainers.map((t) => ({
      url: absoluteUrl(trainerPath(t)),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
