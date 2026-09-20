import Image from "next/image";
import { Button } from "./Button";
import { GenerativePortrait } from "./GenerativePortrait";
import { HolderPreview } from "./HolderPreview";
import { Roadmap, Utility } from "./RoadmapUtility";
import { getCollectionImages, getHeroImage } from "@/lib/artwork";
import { BRAND, COLLECTION } from "@/lib/master-data";

const DESCRIPTION =
  "Algorithmic flowing-line portraits of the proboscis monkey (Nasalis larvatus) — each one traced from a unique noise field, no two alike.";

export function Hero() {
  const heroImage = getHeroImage() ?? getCollectionImages()[0];

  return (
    <section id="home" className="relative overflow-hidden bg-noir px-6 pt-28 pb-24 sm:px-10 xl:flex xl:min-h-svh xl:flex-col xl:justify-center xl:pt-[5.5rem] xl:pb-6">
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

      <div className="relative mx-auto max-w-[90rem] xl:w-full lg:grid lg:grid-cols-[1fr_auto_auto_1fr]">
        <div className="text-center lg:col-start-2 lg:row-start-1 lg:text-left">
          <p className="animate-fade-up text-[11px] uppercase tracking-[0.5em] text-turquoise">
            Generative Art Collection
          </p>
          <h1 className="animate-fade-up mt-5 font-serif text-6xl leading-[0.95] text-bone sm:text-7xl xl:mt-2 xl:text-5xl">
            {BRAND.name}
          </h1>
        </div>

        {/* Composition: the Hero artwork is the background of one large frame,
            with Roadmap (left) and Utility (right) layered over it, and the
            Holder Portal beside the frame on the far right at its natural
            height. From lg up the artwork covers the whole frame; below lg it
            sits full-width, uncropped, at the top of the frame and fades into
            the text that stacks over its lower part. */}
        <div className="animate-fade-up mt-12 grid gap-6 lg:col-span-4 lg:row-start-2 lg:mt-8 xl:mt-5 lg:grid-cols-[minmax(0,1fr)_13rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="relative overflow-clip border border-bone/15 bg-noir-soft">
            <div className="pointer-events-none absolute inset-x-0 top-0 aspect-square lg:-top-[12%] lg:aspect-auto lg:h-full xl:top-0">
              {heroImage ? (
                <Image
                  src={heroImage}
                  alt="Featured Nasalis Flow generative portrait"
                  fill
                  priority
                  sizes="(min-width: 1280px) 75vw, (min-width: 1024px) 70vw, 100vw"
                  className="object-cover xl:object-[50%_72%]"
                />
              ) : (
                <GenerativePortrait seed={5555} noseSize={0.85} decorative className="h-full w-full" />
              )}

              {/* < lg: fade the artwork's lower part into the stacked text. */}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,transparent_50%,rgb(15_23_19/0.7)_75%,var(--color-noir-soft)_100%)] lg:hidden" />
              {/* lg+: the artwork is nudged up so the Nasalis clears the dark
                  headroom sooner, its lower edge fades into the frame, and the
                  scrim is heavy behind the Roadmap and Utility columns but light
                  in the middle so the Nasalis stays clearly visible. */}
              <div className="absolute inset-0 hidden bg-[linear-gradient(180deg,transparent_80%,var(--color-noir-soft)_100%),linear-gradient(90deg,rgb(10_12_10/0.86)_0%,rgb(10_12_10/0.82)_10%,rgb(10_12_10/0.78)_31%,rgb(10_12_10/0.55)_39%,rgb(10_12_10/0.55)_51%,rgb(10_12_10/0.78)_57%,rgb(10_12_10/0.88)_100%)] lg:block xl:hidden" />
              <div className="absolute inset-0 hidden bg-[linear-gradient(180deg,transparent_80%,var(--color-noir-soft)_100%),linear-gradient(90deg,rgb(10_12_10/0.86)_0%,rgb(10_12_10/0.84)_12%,rgb(10_12_10/0.8)_41%,rgb(10_12_10/0.55)_46%,rgb(10_12_10/0.55)_52%,rgb(10_12_10/0.8)_56%,rgb(10_12_10/0.88)_100%)] xl:block" />
            </div>

            <div className="relative grid gap-12 px-6 pt-[62%] pb-10 [text-shadow:0_1px_2px_rgb(0_0_0/0.85),0_0_16px_rgb(0_0_0/0.65)] sm:px-8 md:grid-cols-2 md:gap-x-8 lg:grid-cols-[12rem_9rem_15.5rem] lg:justify-center lg:gap-x-4 lg:px-6 lg:pt-8 xl:grid-cols-[minmax(0,0.77fr)_minmax(0,0.23fr)_minmax(0,1fr)] xl:gap-x-4 xl:pt-4 xl:pb-4 xl:pl-[9%] xl:pr-[2%]">
              <Roadmap />
              {/* Open middle: the artwork shows through between the columns. */}
              <div aria-hidden="true" className="hidden lg:block" />
              <Utility />
            </div>
          </div>

          <div className="md:max-w-md md:justify-self-end lg:max-w-none lg:justify-self-stretch">
            <HolderPreview />
          </div>
        </div>

        {/* Stays in this position below lg; from lg up it is placed in the
            right cell of the top row, level with the title block. */}
        <div className="mt-16 flex flex-col items-center text-center lg:col-start-3 lg:row-start-1 lg:ml-8 lg:mt-0 xl:ml-16">
          <p className="animate-fade-up text-xs uppercase tracking-[0.35em] text-turquoise">
            {COLLECTION.totalSupply.toLocaleString()} Generative Portraits
          </p>

          <p className="animate-fade-up mt-6 max-w-md text-base leading-relaxed text-bone/75 lg:mt-2 xl:text-sm">
            {DESCRIPTION}
          </p>
        </div>

        <div className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-4 lg:col-span-4 lg:row-start-3 lg:mt-12 xl:mt-5">
          <Button href="/collection" tone="dark" variant="primary">
            Explore Collection
          </Button>
          <Button href="/live" tone="dark" variant="outline">
            Live Render
          </Button>
        </div>
      </div>
    </section>
  );
}
