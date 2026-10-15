import type { MetadataRoute } from "next";
import { WEBSITE } from "@/lib/master-data";

const ROUTES = ["/", "/collection", "/about", "/traits", "/live", "/nasalis-flow-studio.html"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = WEBSITE.productionUrl.replace(/\/$/, "");
  return ROUTES.map((path) => ({ url: `${base}${path === "/" ? "" : path}` || base }));
}
