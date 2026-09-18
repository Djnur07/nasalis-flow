import Image from "next/image";
import { Breadcrumb } from "./Breadcrumb";
import { GenerativePortrait } from "./GenerativePortrait";
import { getCollectionImages } from "@/lib/artwork";
import { BRAND, COLLECTION, SOCIAL } from "@/lib/master-data";

const LEDE = `${COLLECTION.name} is a collection of ${COLLECTION.totalSupply.toLocaleString()} generative portraits of the proboscis monkey (Nasalis larvatus), a primate endemic to Borneo whose survival is increasingly threatened by the loss of mangrove forest.`;

const PARAGRAPHS = [
  "Each piece is built not from flat color fields but from thousands of flowing lines that follow a noise field while tracing the contours of its form.",
  "The proboscis monkey's nose, a natural marker of dominance in males, becomes the collection's core rarity trait: the larger it is, the rarer the piece.",
];

export function About() {
  const images = getCollectionImages();
  const featureImage = images[2] ?? images[0];
  const inlineImage = images[5] ?? images[1];

  return (
    <div className="pt-32 pb-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <Breadcrumb current="About" />
        <h1 className="mt-6 max-w-2xl font-serif text-5xl text-bone sm:text-6xl">
          About {BRAND.name}
        </h1>
      </div>

      <figure className="mx-auto mt-14 max-w-5xl px-6 sm:px-10">
        <div className="aspect-[16/9] w-full overflow-hidden border border-bone/10 bg-noir-soft">
          {featureImage ? (
            <Image
              src={featureImage}
              alt={`${BRAND.name} generative portrait`}
              width={1600}
              height={900}
              className="h-full w-full object-cover"
              priority
            />
          ) : (
            <GenerativePortrait
              seed={7}
              label={`${BRAND.name} generative portrait — placeholder artwork`}
              className="h-full w-full"
            />
          )}
        </div>
        <figcaption className="mt-3 text-[11px] uppercase tracking-[0.25em] text-bone/50">
          Fig. 01 — Nasalis Flow generative portrait
        </figcaption>
      </figure>

      <div className="mx-auto mt-16 max-w-2xl px-6 sm:px-10">
        <p className="font-serif text-2xl leading-snug text-bone sm:text-3xl">{LEDE}</p>

        <p className="mt-8 text-base leading-relaxed text-bone/80">{PARAGRAPHS[0]}</p>

        <figure className="my-10">
          <div className="aspect-[4/5] w-full max-w-sm overflow-hidden border border-bone/10 bg-noir-soft">
            {inlineImage ? (
              <Image
                src={inlineImage}
                alt={`${BRAND.name} generative portrait detail`}
                width={640}
                height={800}
                className="h-full w-full object-cover"
              />
            ) : (
              <GenerativePortrait
                seed={19}
                label={`${BRAND.name} generative portrait detail — placeholder artwork`}
                className="h-full w-full"
              />
            )}
          </div>
          <figcaption className="mt-3 text-[11px] uppercase tracking-[0.25em] text-bone/50">
            Fig. 02 — Detail, nose-class variation
          </figcaption>
        </figure>

        <p className="text-base leading-relaxed text-bone/80">{PARAGRAPHS[1]}</p>

        <p className="mt-8 text-base leading-relaxed text-bone/80">
          Fully open-source —{" "}
          <a
            href={SOCIAL.github}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-bone"
          >
            View on GitHub
          </a>
        </p>
      </div>
    </div>
  );
}
