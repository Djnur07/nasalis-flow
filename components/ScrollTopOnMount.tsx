"use client";

import { useEffect } from "react";

/** Forces the viewport back to the top on mount, and again shortly after —
 * guards against any late layout shift (e.g. images finishing load) nudging
 * the scroll position away from the top right after navigating to Home. */
export function ScrollTopOnMount() {
  useEffect(() => {
    const scrollTop = () => window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    scrollTop();
    const t1 = setTimeout(scrollTop, 50);
    const t2 = setTimeout(scrollTop, 300);
    const t3 = setTimeout(scrollTop, 800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return null;
}
