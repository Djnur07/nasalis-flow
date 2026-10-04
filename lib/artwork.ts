import fs from "node:fs";
import path from "node:path";

const IMAGE_EXTENSIONS = /\.(png|jpe?g|webp|avif|gif)$/i;
const HERO_CANDIDATES = ["hero.png", "hero.jpg", "hero.jpeg", "hero.webp", "hero.avif"];

/** Looks for a hand-placed hero image in /public before falling back to a placeholder. */
export function getHeroImage(): string | undefined {
  const publicDir = path.join(process.cwd(), "public");
  const found = HERO_CANDIDATES.find((file) => fs.existsSync(path.join(publicDir, file)));
  return found ? `/${found}` : undefined;
}

/** Natural sort so "Nasalis-2.png" comes before "Nasalis-10.png" instead of after. */
function compareNatural(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

/** Reads real artwork from /public/images so the gallery upgrades itself once files land there. */
export function getCollectionImages(): string[] {
  const dir = path.join(process.cwd(), "public", "images");
  try {
    return fs
      .readdirSync(dir)
      .filter((file) => IMAGE_EXTENSIONS.test(file))
      .sort(compareNatural)
      .map((file) => `/images/${file}`);
  } catch {
    return [];
  }
}

// Hand-picked cream-background portraits (public/images/hero-cream-*.png),
// still available for other sections (e.g. About) that want a guaranteed cream look.
const CREAM_PORTRAITS = [
  "/images/hero-cream-1.png",
  "/images/hero-cream-2.png",
  "/images/hero-cream-3.png",
  "/images/hero-cream-4.png",
];

export function getCreamPortraits(): string[] {
  const publicDir = path.join(process.cwd(), "public");
  return CREAM_PORTRAITS.filter((src) => fs.existsSync(path.join(publicDir, src.slice(1))));
}

/** Picks `count` random images from the full collection pool each time it's called. */
export function getRandomPortraits(count: number): string[] {
  const images = [...getCollectionImages()];
  for (let i = images.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [images[i], images[j]] = [images[j], images[i]];
  }
  return images.slice(0, count);
}
