import Link from "next/link";
import { BRAND } from "@/lib/master-data";

type BreadcrumbProps = {
  current: string;
};

export function Breadcrumb({ current }: BreadcrumbProps) {
  return (
    <p className="text-[11px] uppercase tracking-[0.3em] text-bone/55">
      <Link href="/" className="transition-colors hover:text-bone">
        {BRAND.name}
      </Link>
      <span className="mx-2 text-bone/35">/</span>
      <span className="text-bone/80">{current}</span>
    </p>
  );
}
