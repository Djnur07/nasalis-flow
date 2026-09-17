import { XIcon } from "./XIcon";
import { X_URL } from "@/lib/social";

const EXPLORE_LINKS = [
  { label: "Collection", href: "#collection" },
  { label: "About", href: "#about" },
  { label: "Traits", href: "#traits" },
];

const SOCIAL_LINKS = [
  { label: "OpenSea", href: "#" },
];

export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-cream">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 sm:px-10 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-serif text-2xl text-ink">Nasalis Flow</p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-ink/50">5,555 Generative Portraits</p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-12 gap-y-8 text-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink/40">Explore</p>
            <ul className="mt-3 space-y-3">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.label}>
                  <a className="text-ink/70 transition-colors hover:text-ink" href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink/40">Social</p>
            <ul className="mt-3 space-y-3">
              <li>
                <a
                  className="inline-flex items-center gap-2 text-ink/70 transition-colors hover:text-ink"
                  href={X_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Nasalis Flow on X"
                >
                  <XIcon className="h-3.5 w-3.5" />
                  X
                </a>
              </li>
              {SOCIAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    className="text-ink/70 transition-colors hover:text-ink"
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

      <div className="border-t border-ink/10 px-6 py-6 text-center text-xs text-ink/40 sm:px-10">
        {`© ${new Date().getFullYear()} Nasalis Flow. All rights reserved.`}
      </div>
    </footer>
  );
}
