import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: hasil build ada di folder `out`, siap di-host gratis di Cloudflare Pages.
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  // Proyek ini tidak memakai ESLint supaya tetap ringan.
  eslint: { ignoreDuringBuilds: true },
  // Pastikan Next memakai folder proyek ini sebagai root.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
