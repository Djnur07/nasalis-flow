import type { MetadataRoute } from "next";
import { WEBSITE } from "@/lib/master-data";

export default function robots(): MetadataRoute.Robots {
  const base = WEBSITE.productionUrl.replace(/\/$/, "");
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/holder-portal-test"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
