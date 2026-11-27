import type { Metadata, Viewport } from "next";
import { Anton, Barlow, Geist_Mono } from "next/font/google";
import { site } from "@/data/site";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Preloader } from "@/components/motion/Preloader";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Cursor } from "@/components/motion/Cursor";
import { Animations } from "@/components/motion/Animations";
import "./globals.css";

const display = Anton({ subsets: ["latin"], weight: "400", variable: "--f-display", display: "swap" });
const body = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--f-body",
  display: "swap",
});
const mono = Geist_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--f-mono", display: "swap" });

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
  themeColor: "#0d0d0c",
};

// Dijalankan sebelum paint: tandai bahwa JS aktif (supaya elemen bisa disembunyikan dulu
// lalu dianimasikan), dan putar preloader hanya sekali per sesi.
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');try{var m=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(m){d.classList.add('rm')}else if(!sessionStorage.getItem('ptp-intro')){d.classList.add('intro')}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <Preloader />
        <SmoothScroll />
        <Cursor />
        <Animations />
        <div className="grain" aria-hidden="true" />
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
