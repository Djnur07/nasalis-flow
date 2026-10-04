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

/** Short, thin flowing-line accent that sits under each section heading. */
function FlowAccent() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 24"
      className="mt-4 h-5 w-32 text-turquoise"
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

/** A small glowing dot that travels left-to-right along the top border of its card, echoing a signal pulse. `delay` staggers items so they don't all pulse in sync. */
function TravelDot({ delay = 0 }: { delay?: number }) {
  return (
    <span
      aria-hidden="true"
      className="animate-travel absolute top-0 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-turquoise shadow-[0_0_6px_1px_rgba(178,85,46,0.5)]"
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

/** Small spinning ring with a single bright node — a quiet nod to an orbiting process/algorithm running. `duration` varies slightly per item so the row doesn't move in lockstep. */
function OrbitIcon({ duration = 5 }: { duration?: number }) {
  return (
    <span aria-hidden="true" className="relative inline-block h-4 w-4 shrink-0">
      <span
        className="animate-orbit absolute inset-0 rounded-full border border-bone/25"
        style={{ animationDuration: `${duration}s` }}
      >
        <span className="absolute -top-[2px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-turquoise" />
      </span>
    </span>
  );
}

const HEADING = "font-serif text-4xl uppercase tracking-[0.08em] text-bone";
const NUMBER = "font-mono text-xs tracking-[0.12em] text-bone/45";
const TITLE = "text-sm font-semibold uppercase tracking-[0.1em] text-bone";
const BODY = "text-[13px] leading-relaxed text-bone/65";

/** Roadmap section — nine phases laid out as a three-column grid. */
export function Roadmap() {
  return (
    <section id="roadmap" aria-labelledby="roadmap-heading">
      <h2 id="roadmap-heading" className={HEADING}>
        Roadmap
      </h2>
      <FlowAccent />

      <ol className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {ROADMAP.map((item, index) => (
          <li key={item.title} className="relative border-t border-bone/20 pt-5">
            <TravelDot delay={index * 0.4} />
            <span className={NUMBER}>{pad(index + 1)}</span>
            <h3 className={`mt-2 ${TITLE}`}>{item.title}</h3>
            <p className={`mt-2 ${BODY}`}>{item.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Utility section — six cards laid out as a three-column grid. */
export function Utility() {
  return (
    <section id="utility" aria-labelledby="utility-heading">
      <h2 id="utility-heading" className={HEADING}>
        Utility
      </h2>
      <FlowAccent />

      <ol className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {UTILITY.map((item, index) => (
          <li key={item.title} className="border border-bone/15 bg-noir-soft/60 p-6">
            <div className="flex items-center gap-3">
              <OrbitIcon duration={4.2 + index * 0.6} />
              <span className={TITLE}>
                {pad(index + 1)} {item.title}
              </span>
            </div>
            <p className="mt-4 font-serif text-base leading-snug text-bone">{item.tagline}</p>
            <p className={`mt-2 ${BODY}`}>{item.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
