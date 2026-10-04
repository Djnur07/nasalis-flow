import Image from "next/image";
import { Breadcrumb } from "./Breadcrumb";
import { GenerativePortrait } from "./GenerativePortrait";
import { getRandomPortraits } from "@/lib/artwork";
import { BRAND, COLLECTION, SOCIAL } from "@/lib/master-data";

const LEDE = `${COLLECTION.name} is a collection of ${COLLECTION.totalSupply.toLocaleString()} generative portraits of the proboscis monkey (Nasalis larvatus), a primate endemic to Borneo whose survival is increasingly threatened by the loss of mangrove forest.`;

const PARAGRAPHS = [
  "Each piece is built not from flat color fields but from thousands of flowing lines that follow a noise field while tracing the contours of its form.",
  "The proboscis monkey's nose, a natural marker of dominance in males, becomes the collection's core rarity trait: the larger it is, the rarer the piece.",
];

export function About() {
  const images = getRandomPortraits(6);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col px-6 pt-20 pb-8 sm:px-10">
      <Breadcrumb current="About" />

      <div className="mt-6 grid flex-1 items-center gap-10 lg:grid-cols-[1fr_1fr]">
        {images.length > 0 ? (
          <div className="grid grid-cols-3 gap-1.5">
            {images.map((src, index) => (
              <div
                key={src}
                className="relative aspect-square overflow-hidden border border-bone/10 bg-noir-soft"
              >
                <Image
                  src={src}
                  alt={`${BRAND.name} generative portrait ${index + 1}`}
                  fill
                  priority={index < 3}
                  sizes="(min-width: 1024px) 14vw, 30vw"
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative aspect-square overflow-hidden border border-bone/10 bg-noir-soft">
            <GenerativePortrait
              seed={7}
              label={`${BRAND.name} generative portrait — placeholder artwork`}
              className="h-full w-full"
            />
          </div>
        )}

        <div>
          <h1 className="font-serif text-4xl text-bone sm:text-5xl">About {BRAND.name}</h1>

          <p className="mt-5 text-sm leading-relaxed text-bone/80">{LEDE}</p>

          <p className="mt-5 text-sm leading-relaxed text-bone/80">{PARAGRAPHS[0]}</p>
          <p className="mt-3 text-sm leading-relaxed text-bone/80">{PARAGRAPHS[1]}</p>

          <p className="mt-5 text-sm leading-relaxed text-bone/80">
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
    </div>
  );
}
