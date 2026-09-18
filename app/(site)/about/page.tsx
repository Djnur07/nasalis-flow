import type { Metadata } from "next";
import { About } from "@/components/About";

export const metadata: Metadata = {
  title: "About — Nasalis Flow",
  description:
    "Nasalis Flow is a collection of 5,555 generative portraits of the proboscis monkey (Nasalis larvatus), created from flowing lines that follow a noise field and trace the contours of the subject.",
};

export default function AboutPage() {
  return <About />;
}
