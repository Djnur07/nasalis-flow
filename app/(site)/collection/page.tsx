import type { Metadata } from "next";
import { Collection } from "@/components/Collection";

export const metadata: Metadata = {
  title: "Collection — Nasalis Flow",
  description:
    "Browse the Nasalis Flow gallery — a preview of 5,555 generative portraits of the proboscis monkey (Nasalis larvatus).",
};

export default function CollectionPage() {
  return <Collection />;
}
