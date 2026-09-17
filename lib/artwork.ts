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
