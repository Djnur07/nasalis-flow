import Image from "next/image";
import { Button } from "./Button";
import { GenerativePortrait } from "./GenerativePortrait";
import { HolderPreview } from "./HolderPreview";
import { getCollectionImages, getHeroImage } from "@/lib/artwork";
import { BRAND, COLLECTION } from "@/lib/master-data";

const DESCRIPTION =
  "Algorithmic flowing-line portraits of the proboscis monkey (Nasalis larvatus) — each one traced from a unique noise field, no two alike.";

export function Hero() {
  const heroImage = getHeroImage() ?? getCollectionImages()[0];

  return (
    <section id="home" className="relative overflow-hidden bg-noir px-6 pt-32 pb-24 sm:px-10">
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.14]"
      >
        <path
          d="M -50 620 C 220 520, 380 700, 600 560 S 980 420, 1250 520"
          stroke="var(--color-bone)"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M -50 180 C 260 300, 420 90, 640 220 S 1000 340, 1250 200"
          stroke="var(--color-amber)"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M -50 420 C 300 380, 500 460, 700 400 S 1020 340, 1250 400"
          stroke="var(--color-turquoise)"
          strokeWidth="1"
          fill="none"
        />
      </svg>

      <div className="relative mx-auto max-w-6xl">
        <div className="text-center">
          <p className="animate-fade-up text-[11px] uppercase tracking-[0.5em] text-turquoise">
            Generative Art Collection
          </p>
          <h1 className="animate-fade-up mt-5 font-serif text-6xl leading-[0.95] text-bone sm:text-7xl lg:text-8xl">
            {BRAND.name}
          </h1>
        </div>

        {/* Artwork (~60%) and Holder Portal (~40%) as one gallery composition —
            stacked on mobile/tablet, side by side from lg up. The fixed
            min-height keeps the artwork column stable regardless of the
            portal's connected/disconnected content length. */}
        <div className="animate-fade-up mt-14 grid gap-6 lg:grid-cols-[3fr_2fr] lg:items-stretch lg:gap-8">
          <div className="relative overflow-hidden border border-bone/15">
            <div className="relative aspect-[4/5] w-full bg-noir-soft lg:h-full lg:aspect-auto">
              {heroImage ? (
                <Image
                  src={heroImage}
                  alt="Featured Nasalis Flow generative portrait"
                  fill
                  priority
                  sizes="(min-width: 1024px) 55vw, (min-width: 640px) 512px, 90vw"
                  className="object-cover"
                />
              ) : (
                <GenerativePortrait seed={5555} noseSize={0.85} decorative className="h-full w-full" />
              )}
            </div>
          </div>

          <HolderPreview />
        </div>

        <div className="mt-16 flex flex-col items-center text-center">
          <p className="animate-fade-up text-xs uppercase tracking-[0.35em] text-turquoise">
            {COLLECTION.totalSupply.toLocaleString()} Generative Portraits
          </p>

          <p className="animate-fade-up mt-6 max-w-md text-base leading-relaxed text-bone/75">
            {DESCRIPTION}
          </p>

          <div className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button href="/collection" tone="dark" variant="primary">
              Explore Collection
            </Button>
            <Button href="/live" tone="dark" variant="outline">
              Live Render
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
