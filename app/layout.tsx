import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Fraunces } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Nasalis Flow — 5,555 Generative Portraits",
  description:
    "Nasalis Flow is a collection of 5,555 generative portraits of the proboscis monkey (Nasalis larvatus), exploring form, flow, and identity through thousands of flowing lines.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${fraunces.variable} antialiased`}
    >
      <body className="bg-cream text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
