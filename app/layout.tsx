import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { site } from "@/data/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f766e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <header className="site-header">
          <div className="container">
            <Link href="/" className="logo">
              {site.name}
            </Link>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="site-footer">
          <div className="container">
            <p>
              © {new Date().getFullYear()} {site.name} · {site.city}, {site.regency}, {site.region}
            </p>
            <p className="muted">
              Informasi biaya dan jadwal bisa berubah. Selalu konfirmasi langsung ke trainer.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
