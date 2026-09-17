import { TRAITS as MASTER_TRAITS } from "@/lib/master-data";

type TraitKey = keyof typeof MASTER_TRAITS;

type Trait = {
  name: string;
  description: string;
  variants: string[];
};

// Descriptions live here because lib/master-data.ts only defines the
// official category names and values, not display copy.
const TRAIT_DESCRIPTIONS: Record<TraitKey, string> = {
  palette: "Line color palette.",
  flowStyle: "Style of the flowing line system.",
  density: "Line density.",
  noseClass:
    "Nose classification — the collection's primary rarity trait, based on the biological characteristic that a larger nose is associated with dominance in male proboscis monkeys.",
  background: "Background style.",
  guideLine: "Thin silhouette guide line beneath the flowing-line layer.",
};

const TRAITS: Trait[] = (Object.keys(MASTER_TRAITS) as TraitKey[]).map((key) => ({
  name: MASTER_TRAITS[key].name,
  description: TRAIT_DESCRIPTIONS[key],
  variants: MASTER_TRAITS[key].values,
}));

const PULL_QUOTE =
  "The proboscis monkey's nose becomes the collection's core rarity trait: the larger it is, the rarer the piece.";

export function Traits() {
  return (
    <section id="traits" className="mx-auto max-w-6xl px-6 py-28 sm:px-10">
      <header className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-brown">Traits</p>
        <h2 className="mt-4 font-serif text-4xl text-ink sm:text-5xl">Traits</h2>
        <p className="mt-5 text-lg italic leading-relaxed text-ink/70">{`"${PULL_QUOTE}"`}</p>
      </header>

      <dl className="mt-16 grid gap-px overflow-hidden rounded-sm bg-ink/10 sm:grid-cols-2">
        {TRAITS.map((trait, index) => (
          <div key={trait.name} className="bg-cream px-8 py-10">
            <dt className="flex items-baseline gap-3 font-serif text-2xl text-ink">
              <span className="text-sm text-gold">{String(index + 1).padStart(2, "0")}</span>
              {trait.name}
            </dt>
            <dd className="mt-3 text-ink/70">{trait.description}</dd>
            <ul className="mt-4 flex flex-wrap gap-2">
              {trait.variants.map((variant) => (
                <li
                  key={variant}
                  className="rounded-full border border-ink/15 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-ink/60"
                >
                  {variant}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </dl>
    </section>
  );
}
