import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Fraunces } from "next/font/google";
import { Providers } from "./providers";
import { SOCIAL, WEBSITE } from "@/lib/master-data";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const SITE_TITLE = "Nasalis Flow — 5,555 Generative Portraits";
const SITE_DESCRIPTION =
  "Nasalis Flow is a collection of 5,555 generative portraits of the proboscis monkey (Nasalis larvatus), exploring form, flow, and identity through thousands of flowing lines.";
const SHARE_IMAGE = { url: "/og-image.png", width: 1200, height: 630, alt: "Nasalis Flow — generative flow-line portraits" };

export const metadata: Metadata = {
  metadataBase: new URL(WEBSITE.productionUrl),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Nasalis Flow",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    site: `@${SOCIAL.x.split("/").pop()}`,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [SHARE_IMAGE.url],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} antialiased`}
    >
      <body className="bg-cream text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
