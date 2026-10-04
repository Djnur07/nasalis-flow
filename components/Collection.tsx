import { ArtworkCard } from "./ArtworkCard";
import { Breadcrumb } from "./Breadcrumb";
import { Button } from "./Button";
import { getCollectionImages } from "@/lib/artwork";
import { COLLECTION } from "@/lib/master-data";

// PREVIEW_COUNT is a curated gallery preview, not the collection's supply —
// capped regardless of how many real files eventually land in /public/images.
const { totalSupply: TOTAL_SUPPLY, previewCount: PREVIEW_COUNT } = COLLECTION;

// Scopes the preview to the Nasalis Flow artwork series, ignoring any other
// unrelated files that may also live under /public/images.
const NASALIS_IMAGE_PATTERN = /\/Nasalis-\d+\.png$/i;

export function Collection() {
  const realImages = getCollectionImages()
    .filter((src) => NASALIS_IMAGE_PATTERN.test(src))
    .slice(0, PREVIEW_COUNT);

  // Always exactly PREVIEW_COUNT items (50 = 10 cols x 5 rows), padding any
  // gap with placeholder portraits so the grid never comes up short.
  const items = Array.from({ length: PREVIEW_COUNT }, (_, index) => ({
    id: index + 1,
    src: realImages[index],
  }));

  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[1800px] flex-col px-8 pt-24 pb-10 sm:px-12">
      <Breadcrumb current="Collection" />

      <header className="mt-4 flex flex-col items-center text-center">
        <h1 className="font-serif text-3xl text-bone sm:text-4xl">Collection</h1>
        <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-turquoise">
          {TOTAL_SUPPLY.toLocaleString()} Generative Portraits
        </p>
        <p className="mt-3 max-w-xl text-sm text-bone/70">
          A gallery preview — each portrait generated individually, with the nose, its core rarity
          trait, setting the tone for everything else.
        </p>
      </header>

      <div className="mt-6 grid flex-1 grid-cols-5 gap-1.5 sm:grid-cols-10">
        {items.map((item, index) => (
          <ArtworkCard key={item.id} id={item.id} src={item.src} priority={index < 10} />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <p className="text-xs text-bone/60">Every portrait traces back to a single hash.</p>
        <Button href="/live" tone="light" variant="outline" className="!px-5 !py-2 text-[11px]">
          See It Rendered Live
        </Button>
      </div>
    </div>
  );
}
