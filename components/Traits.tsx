import { Breadcrumb } from "./Breadcrumb";
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
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[1600px] flex-col px-10 pt-20 pb-8 sm:px-14">
      <Breadcrumb current="Traits" />

      <header className="mt-4 flex flex-col items-center text-center">
        <h1 className="font-serif text-4xl text-bone sm:text-5xl">Traits</h1>
        <p className="mt-2 max-w-2xl text-base italic leading-snug text-bone/75">{`"${PULL_QUOTE}"`}</p>
      </header>

      <dl className="mt-6 grid flex-1 grid-cols-1 gap-px bg-bone/10 sm:grid-cols-2 lg:grid-cols-3">
        {TRAITS.map((trait, index) => (
          <div key={trait.name} className="flex flex-col bg-noir px-8 py-6">
            <span className="font-mono text-xs tracking-[0.2em] text-turquoise">
              {`SPECIMEN ${String(index + 1).padStart(2, "0")} / ${String(TRAITS.length).padStart(2, "0")}`}
            </span>
            <dt className="mt-2 font-serif text-2xl text-bone">{trait.name}</dt>
            <dd className="mt-1 text-sm leading-snug text-bone/70">{trait.description}</dd>

            <ul className="mt-4 divide-y divide-bone/10 border-t border-bone/10">
              {trait.variants.map((variant, variantIndex) => (
                <li
                  key={variant}
                  className="flex items-baseline justify-between gap-4 py-2 text-sm text-bone/80"
                >
                  <span className="font-mono text-xs text-bone/50">
                    {String(variantIndex + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1">{variant}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </dl>
    </div>
  );
}
