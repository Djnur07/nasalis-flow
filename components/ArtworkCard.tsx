import Image from "next/image";
import { GenerativePortrait } from "./GenerativePortrait";

type ArtworkCardProps = {
  id: number;
  src?: string;
  title?: string;
};

export function ArtworkCard({ id, src, title }: ArtworkCardProps) {
  const label = title ?? `Nasalis Flow #${id}`;

  return (
    <figure className="group relative aspect-square overflow-hidden rounded-sm bg-charcoal">
      {src ? (
        <Image
          src={src}
          alt={label}
          fill
          sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      ) : (
        <GenerativePortrait
          seed={id}
          label={`${label} — placeholder artwork`}
          className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-105"
        />
      )}
      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center bg-gradient-to-t from-ink/85 to-transparent px-4 py-3 text-cream opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="text-xs tracking-[0.15em]">{label}</span>
      </figcaption>
    </figure>
  );
}
