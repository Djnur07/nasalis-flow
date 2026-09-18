import type { Metadata } from "next";
import { Traits } from "@/components/Traits";

export const metadata: Metadata = {
  title: "Traits — Nasalis Flow",
  description: "The trait categories behind Nasalis Flow's 5,555 generative portraits.",
};

export default function TraitsPage() {
  return <Traits />;
}
