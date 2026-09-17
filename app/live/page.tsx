import type { Metadata } from "next";
import { LiveRenderer } from "@/components/LiveRenderer";

// The web-app integration of reference/nasalis-flow-live.html: the same
// hash → PRNG → traits → artwork engine (lib/liveRenderer.ts), running here
// as a real page instead of a standalone HTML file.
export const metadata: Metadata = {
  title: "Live Render Preview — Nasalis Flow",
  description:
    "A live, code-generated render of the Nasalis Flow engine — the same hash always produces the same artwork.",
};

export default function LivePage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
        <header className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-brown">Nasalis Flow</p>
          <h1 className="mt-4 font-serif text-4xl text-ink sm:text-5xl">Live Render Preview</h1>
          <p className="mt-5 text-ink/70">
            Every portrait is generated live from a hash — the same hash always produces the same
            artwork. Randomize for a new one, or render a specific hash to test it.
          </p>
        </header>

        <div className="mt-14">
          <LiveRenderer />
        </div>
      </div>
    </main>
  );
}
