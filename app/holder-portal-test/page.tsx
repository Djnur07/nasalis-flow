import type { Metadata } from "next";
import { HolderPortalTest } from "@/components/HolderPortalTest";

// Standalone test route for validating Holder Portal ownership detection
// against the Block Titans test collection, kept outside the (site) route
// group like /live so it never touches production Navbar/Footer/config.
// Not linked from primary navigation and excluded from indexing.
export const metadata: Metadata = {
  title: "Holder Portal Test — Block Titans",
  description: "Internal test harness for Holder Portal NFT ownership detection. Not a production page.",
  robots: { index: false, follow: false },
};

export default function HolderPortalTestPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
        <HolderPortalTest />
      </div>
    </main>
  );
}
