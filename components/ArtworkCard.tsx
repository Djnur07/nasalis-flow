import Image from "next/image";
import { GenerativePortrait } from "./GenerativePortrait";

type ArtworkCardProps = {
  id: number;
  src?: string;
  title?: string;
  priority?: boolean;
};

export function ArtworkCard({ id, src, title, priority = false }: ArtworkCardProps) {
  const label = title ?? `Nasalis Flow #${id}`;

  return (
    <figure className="group relative aspect-square overflow-hidden bg-noir">
      {src ? (
        <Image
          src={src}
          alt={label}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 31vw, (min-width: 640px) 47vw, 92vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      ) : (
        <GenerativePortrait
          seed={id}
          label={`${label} — placeholder artwork`}
          className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-105"
        />
      )}
      <div className="pointer-events-none absolute inset-0 opacity-0 ring-1 ring-inset ring-turquoise/50 transition-opacity duration-300 group-hover:opacity-100" />
      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center bg-gradient-to-t from-noir/90 to-transparent px-4 py-3 text-bone opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="text-xs tracking-[0.15em]">{label}</span>
      </figcaption>
    </figure>
  );
}
