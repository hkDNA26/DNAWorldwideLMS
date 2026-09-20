import type { MetadataRoute } from "next";

/**
 * This is an internal staff LMS, not a public site — nothing here should be in a
 * search index. Google was found crawling /login on the Railway URL, so this is
 * paired with an X-Robots-Tag header in next.config.ts: robots.txt asks crawlers
 * not to fetch, the header tells them not to index anything they already have.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
