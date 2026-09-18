import Link from "next/link";
import { XIcon } from "./XIcon";
import { BRAND, COLLECTION, MARKETPLACE, SOCIAL } from "@/lib/master-data";

const EXPLORE_LINKS = [
  { label: "Collection", href: "/collection" },
  { label: "About", href: "/about" },
  { label: "Traits", href: "/traits" },
  { label: "Live", href: "/live" },
];

const SOCIAL_LINKS = [
  { label: "OpenSea", href: MARKETPLACE.openSea || "#" },
];

export function Footer() {
  return (
    <footer className="border-t border-bone/10 bg-noir-soft text-bone">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 sm:px-10 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-serif text-2xl text-bone">{BRAND.name}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-bone/60">
            {COLLECTION.totalSupply.toLocaleString()} Generative Portraits
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-12 gap-y-8 text-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-bone/50">Explore</p>
            <ul className="mt-3 space-y-3">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link className="text-bone/78 transition-colors hover:text-bone" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-bone/50">Social</p>
            <ul className="mt-3 space-y-3">
              <li>
                <a
                  className="inline-flex items-center gap-2 text-bone/78 transition-colors hover:text-bone"
                  href={SOCIAL.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${BRAND.name} on X`}
                >
                  <XIcon className="h-3.5 w-3.5" />
                  X
                </a>
              </li>
              {SOCIAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    className="text-bone/78 transition-colors hover:text-bone"
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      <div className="border-t border-bone/10 px-6 py-6 text-center text-xs text-bone/50 sm:px-10">
        {`© ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.`}
      </div>
    </footer>
  );
}
