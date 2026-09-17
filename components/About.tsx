import { GenerativePortrait } from "./GenerativePortrait";

const PARAGRAPHS = [
  "Nasalis Flow is a collection of 5,555 generative portraits of the proboscis monkey (Nasalis larvatus), a primate endemic to Borneo whose survival is increasingly threatened by the loss of mangrove forest.",
  "Each piece is built not from flat color fields but from thousands of flowing lines that follow a noise field while tracing the contours of its form.",
  "The proboscis monkey's nose, a natural marker of dominance in males, becomes the collection's core rarity trait: the larger it is, the rarer the piece.",
];

export function About() {
  return (
    <section id="about" className="bg-cream-dim">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-28 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="text-xs uppercase tracking-[0.3em] text-brown">About</p>
          <h2 className="mt-4 font-serif text-4xl text-ink sm:text-5xl">About Nasalis Flow</h2>
          <div className="mt-8 aspect-[4/5] max-w-sm overflow-hidden rounded-sm">
            <GenerativePortrait
              seed={42}
              label="Nasalis Flow generative portrait — placeholder artwork"
              className="h-full w-full"
            />
          </div>
        </div>

        <div className="space-y-6 text-lg leading-relaxed text-ink/80">
          {PARAGRAPHS.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
