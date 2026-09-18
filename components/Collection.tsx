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

// The gallery grid runs 1/2/3 columns across breakpoints, so trimming down
// to a multiple of 6 (their LCM) keeps every row full instead of leaving a
// ragged, half-empty final row.
const GRID_ALIGNMENT = 6;

function alignToFullRows<T>(list: T[]): T[] {
  if (list.length < GRID_ALIGNMENT) return list;
  return list.slice(0, list.length - (list.length % GRID_ALIGNMENT));
}

export function Collection() {
  const images = alignToFullRows(
    getCollectionImages()
      .filter((src) => NASALIS_IMAGE_PATTERN.test(src))
      .slice(0, PREVIEW_COUNT),
  );
  const items =
    images.length > 0
      ? images.map((src, index) => ({ id: index + 1, src }))
      : alignToFullRows(Array.from({ length: PREVIEW_COUNT }, (_, index) => ({ id: index + 1, src: undefined })));

  return (
    <div className="mx-auto max-w-6xl px-6 pt-32 pb-28 sm:px-10">
      <Breadcrumb current="Collection" />

      <header className="mt-6 max-w-2xl">
        <h1 className="font-serif text-5xl text-bone sm:text-6xl">Collection</h1>
        <p className="mt-4 text-xs uppercase tracking-[0.3em] text-turquoise">
          {TOTAL_SUPPLY.toLocaleString()} Generative Portraits
        </p>
        <p className="mt-5 text-bone/75">
          A gallery preview of the full {TOTAL_SUPPLY.toLocaleString()}-piece collection — each
          portrait generated individually, with the nose, its core rarity trait, setting the tone
          for everything else.
        </p>
      </header>

      <div className="mt-16 grid grid-cols-1 gap-px bg-bone/10 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <ArtworkCard key={item.id} id={item.id} src={item.src} priority={index < 3} />
        ))}
      </div>

      <div className="mt-16 flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-bone/60">Every portrait traces back to a single hash.</p>
        <Button href="/live" tone="light" variant="outline">
          See It Rendered Live
        </Button>
      </div>
    </div>
  );
}
