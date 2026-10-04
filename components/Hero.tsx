import Image from "next/image";
import { Button } from "./Button";
import { FlowFieldCanvas } from "./FlowFieldCanvas";
import { GenerativePortrait } from "./GenerativePortrait";
import { HolderPreview } from "./HolderPreview";
import { LiveSeed } from "./LiveSeed";
import { Roadmap, Utility } from "./RoadmapUtility";
import { ScrollTopOnMount } from "./ScrollTopOnMount";
import { getRandomPortraits } from "@/lib/artwork";
import { BRAND, COLLECTION } from "@/lib/master-data";

const DESCRIPTION =
  "Algorithmic flowing-line portraits of the proboscis monkey (Nasalis larvatus) — each one traced from a unique noise field, no two alike.";

export function Hero() {
  const heroImages = getRandomPortraits(10);

  return (
    <>
      <ScrollTopOnMount />
      <section id="home" className="relative overflow-hidden bg-noir px-6 pt-28 pb-20 sm:px-10 xl:pt-32">
        <FlowFieldCanvas className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.18]" />

        <div className="relative mx-auto max-w-6xl">
          <div className="text-center">
            <p className="animate-fade-up text-[11px] uppercase tracking-[0.5em] text-turquoise">
              Generative Art Collection
            </p>
            <h1 className="animate-fade-up mt-5 font-serif text-6xl leading-[0.95] text-bone sm:text-7xl">
              {BRAND.name}
            </h1>
          </div>

          <div className="animate-fade-up mt-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-stretch">
            <div className="relative flex items-center justify-center border border-bone/15 bg-noir-soft p-3 lg:aspect-auto">
              {heroImages.length > 0 ? (
                <div className="grid w-full grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
                  {heroImages.map((src, index) => (
                    <div key={src} className="relative aspect-square overflow-hidden">
                      <Image
                        src={src}
                        alt={`Nasalis Flow generative portrait ${index + 1}`}
                        fill
                        priority={index < 2}
                        sizes="(min-width: 1024px) 12vw, 25vw"
                        className="object-contain"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <GenerativePortrait seed={5555} noseSize={0.85} decorative className="h-full w-full" />
              )}
            </div>

            <HolderPreview />
          </div>

          <div className="mt-14 flex flex-col items-center text-center">
            <p className="animate-fade-up text-xs uppercase tracking-[0.35em] text-turquoise">
              {COLLECTION.totalSupply.toLocaleString()} Generative Portraits
            </p>
            <p className="animate-fade-up mt-6 max-w-md text-base leading-relaxed text-bone/75">
              {DESCRIPTION}
            </p>
            <p className="animate-fade-up mt-4">
              <LiveSeed />
            </p>
          </div>

          <div className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button href="/collection" tone="dark" variant="primary">
              Explore Collection
            </Button>
            <Button href="/live" tone="dark" variant="outline">
              Live Render
            </Button>
          </div>
        </div>
      </section>

      <div className="border-t border-bone/10 bg-noir px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <Roadmap />
        </div>
      </div>

      <div className="border-t border-bone/10 bg-noir-soft px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <Utility />
        </div>
      </div>
    </>
  );
}
