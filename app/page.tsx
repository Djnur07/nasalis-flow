import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Collection } from "@/components/Collection";
import { About } from "@/components/About";
import { Traits } from "@/components/Traits";
import { HolderPreview } from "@/components/HolderPreview";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Collection />
        <About />
        <Traits />
        <HolderPreview />
      </main>
      <Footer />
    </>
  );
}
