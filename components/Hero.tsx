import Image from "next/image";
import { Button } from "./Button";
import { GenerativePortrait } from "./GenerativePortrait";
import { WalletButton } from "./WalletButton";
import { XIcon } from "./XIcon";
import { getHeroImage } from "@/lib/artwork";
import { BRAND, COLLECTION, SOCIAL } from "@/lib/master-data";

const QUOTE =
  "An exploration of form, flow, and identity through generative portraits of the proboscis monkey (Nasalis larvatus).";

export function Hero() {
  const heroImage = getHeroImage();

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden bg-charcoal text-cream"
    >
      <div className="absolute inset-0">
        {heroImage ? (
          <Image
            src={heroImage}
            alt="Featured Nasalis Flow generative portrait"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-80"
          />
        ) : (
          <GenerativePortrait seed={5555} noseSize={0.85} decorative className="h-full w-full opacity-70" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-charcoal/30" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6 pt-28 pb-24 sm:px-10">
        <p className="animate-fade-up text-xs uppercase tracking-[0.35em] text-gold">
          {COLLECTION.totalSupply.toLocaleString()} Generative Portraits
        </p>
        <h1 className="animate-fade-up mt-6 max-w-3xl font-serif text-6xl leading-[1.05] sm:text-7xl lg:text-8xl">
          {BRAND.name}
        </h1>
        <p className="animate-fade-up mt-8 max-w-md text-lg italic leading-relaxed text-cream/75">
          {`"${QUOTE}"`}
        </p>
        <div className="animate-fade-up mt-10 flex flex-wrap gap-4">
          <WalletButton tone="dark" variant="primary" />
          <Button href="#collection" tone="dark" variant="outline">
            Explore Collection
          </Button>
          <Button href="/live" tone="dark" variant="outline">
            Live Render
          </Button>
          <Button href={SOCIAL.x} target="_blank" rel="noopener noreferrer" tone="dark" variant="outline">
            <XIcon className="h-3.5 w-3.5" />
            Follow on X
          </Button>
        </div>
      </div>
    </section>
  );
}
