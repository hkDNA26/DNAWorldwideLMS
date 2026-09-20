import type { NextConfig } from "next";

// Applied to every response. Deliberately conservative: a strict Content-Security-
// Policy is not included because course content embeds third-party material
// (SCORM packages in iframes, Vimeo players, the external CPD lesson), and a
// policy tight enough to be worth having would need those origins enumerated
// first — a half-configured CSP gives no protection while breaking lessons.
const securityHeaders = [
  // Stop the site being framed into someone else's page (clickjacking).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Don't let browsers second-guess declared content types, which is what turns a
  // mislabelled upload into executable HTML.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Never leak a full course/certificate URL to third-party sites.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // HTTPS only, once the domain has settled.
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "Permissions-Policy", value: "geolocation=(), microphone=(), payment=()" },
  // Internal staff system: keep it out of search results entirely. robots.txt only
  // asks crawlers not to fetch; this tells them not to index what they already have.
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
