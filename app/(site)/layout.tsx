import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

// Shared chrome for every page except /live, which intentionally stays
// outside this route group so it keeps rendering with no Navbar/Footer,
// exactly as before.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="bg-noir text-bone">{children}</main>
      <Footer />
    </>
  );
}
