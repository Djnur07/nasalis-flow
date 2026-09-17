import { ArtworkCard } from "./ArtworkCard";
import { Button } from "./Button";
import { getCollectionImages } from "@/lib/artwork";
import { COLLECTION } from "@/lib/master-data";

// PREVIEW_COUNT is a curated homepage preview, not the collection's supply —
// capped regardless of how many real files eventually land in /public/images.
const { totalSupply: TOTAL_SUPPLY, previewCount: PREVIEW_COUNT } = COLLECTION;

export function Collection() {
  const images = getCollectionImages().slice(0, PREVIEW_COUNT);
  const items =
    images.length > 0
      ? images.map((src, index) => ({ id: index + 1, src }))
      : Array.from({ length: PREVIEW_COUNT }, (_, index) => ({ id: index + 1, src: undefined }));

  return (
    <section id="collection" className="mx-auto max-w-6xl px-6 py-28 sm:px-10">
      <header className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-brown">
          {TOTAL_SUPPLY.toLocaleString()} Unique Generative Portraits
        </p>
        <h2 className="mt-4 font-serif text-4xl text-ink sm:text-5xl">The Collection</h2>
        <p className="mt-5 text-ink/70">
          A curated selection from the full {TOTAL_SUPPLY.toLocaleString()}-piece collection —
          each portrait generated individually, with the nose, its core rarity trait, setting
          the tone for everything else.
        </p>
      </header>

      <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <ArtworkCard key={item.id} id={item.id} src={item.src} />
        ))}
      </div>

      <div className="mt-14 flex justify-center">
        <Button href="#collection" tone="light" variant="outline">
          Explore Collection
        </Button>
      </div>
    </section>
  );
}
