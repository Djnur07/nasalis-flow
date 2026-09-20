import { COLLECTION } from "@/lib/master-data";

type RoadmapItem = { title: string; description: string };

type UtilityItem = { title: string; tagline: string; description: string };

const ROADMAP: RoadmapItem[] = [
  { title: "Origin", description: "The beginning of Nasalis Flow." },
  { title: "Generation", description: "Building the generative system." },
  {
    title: "Collection",
    description: `Bringing ${COLLECTION.totalSupply.toLocaleString()} unique Nasalis portraits to life.`,
  },
  { title: "Live Render", description: "Making the generative process visible." },
  { title: "Holder", description: "Giving ownership a purpose." },
  { title: "Utility", description: "Expanding each Nasalis beyond a static NFT." },
  { title: "Living Collection", description: "The collection continues to evolve." },
  { title: "Conservation", description: "Connecting digital ownership with the real world." },
  { title: "Legacy", description: "A collection with identity, history, and lineage." },
];

const UTILITY: UtilityItem[] = [
  {
    title: "Holder Remix",
    tagline: "Create from your own identity.",
    description:
      "Generate new visual variants from your own Nasalis while preserving its original token identity and hash lineage.",
  },
  {
    title: "Generative Sound",
    tagline: "See it. Hear it.",
    description:
      "The same hash that defines a Nasalis can become the foundation for generative ambient sound.",
  },
  {
    title: "Physical Edition",
    tagline: "Bring your Nasalis into the physical world.",
    description:
      "Transform your Nasalis into high resolution physical editions generated from the original artwork data.",
  },
  {
    title: "Anniversary Variant",
    tagline: "Your Nasalis evolves with time.",
    description:
      "Generate a new unique variant from the original identity of a token on each anniversary.",
  },
  {
    title: "Family Tree",
    tagline: "Every Nasalis has a lineage.",
    description:
      "Explore the relationship between original tokens, remixes, and future variants through a public generative family tree.",
  },
  {
    title: "Bekantan Conservation",
    tagline: "Digital identity connected to real world conservation.",
    description:
      "Explore symbolic adoption and conservation initiatives supporting the protection of the proboscis monkey and its habitat.",
  },
];

const pad = (n: number) => String(n).padStart(2, "0");

/** Short, thin flowing-line accent that sits under each column heading. */
function FlowAccent() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 24"
      className="mt-4 h-5 w-32 text-turquoise xl:mt-2 xl:h-4 xl:w-28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    >
      <path d="M 0 12 C 30 -2, 55 26, 90 12 S 150 -2, 180 12 S 225 22, 240 10" />
      <path d="M 0 16 C 34 4, 60 28, 96 16 S 156 4, 186 16" opacity="0.5" />
    </svg>
  );
}

const HEADING = "font-serif text-4xl uppercase tracking-[0.08em] text-bone lg:text-3xl xl:text-3xl xl:leading-none";
const NUMBER = "pt-px font-mono text-xs tracking-[0.12em] text-neutral-200 xl:text-[11px]";
const TITLE =
  "text-xs font-semibold uppercase tracking-[0.14em] text-bone xl:leading-[14px] xl:tracking-[0.18em]";
const BODY = "text-[13px] leading-snug text-neutral-200 xl:text-[12.5px] xl:leading-[1.35]";
const ITEM =
  "grid grid-cols-[1.75rem_1fr] gap-x-3 border-t border-bone/20 py-3.5 last:border-b xl:grid-cols-[1.5rem_1fr] xl:gap-x-2 xl:py-2";

/** Roadmap column of the Hero composition (anchor target for the "Roadmap" nav link). */
export function Roadmap() {
  return (
    <section id="roadmap" aria-labelledby="roadmap-heading" className="lg:flex lg:flex-col">
      <h2 id="roadmap-heading" className={HEADING}>
        Roadmap
      </h2>
      <FlowAccent />

      {/* From lg up the list stretches to the full row height so Roadmap ends
          level with the taller Utility column. */}
      <ol className="mt-7 lg:flex lg:flex-1 lg:flex-col xl:mt-3">
        {ROADMAP.map((item, index) => (
          <li key={item.title} className={`${ITEM} lg:flex-1`}>
            <span className={NUMBER}>{pad(index + 1)}</span>
            <div>
              <h3 className={TITLE}>{item.title}</h3>
              <p className={`mt-1 xl:mt-0.5 ${BODY}`}>{item.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Utility column of the Hero composition (anchor target for the "Utility" nav link). */
export function Utility() {
  return (
    <section id="utility" aria-labelledby="utility-heading">
      <h2 id="utility-heading" className={HEADING}>
        Utility
      </h2>
      <FlowAccent />

      <ol className="mt-7 xl:mt-3">
        {UTILITY.map((item, index) => (
          <li key={item.title} className={ITEM}>
            <span className={NUMBER}>{pad(index + 1)}</span>
            <div>
              <h3 className={TITLE}>{item.title}</h3>
              <p className="mt-1.5 font-serif text-base leading-snug text-bone xl:mt-0.5 xl:text-[15px] xl:leading-tight">
                {item.tagline}
              </p>
              <p className={`mt-1.5 xl:mt-0.5 ${BODY}`}>{item.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
