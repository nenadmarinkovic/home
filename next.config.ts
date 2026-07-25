import { execSync } from "node:child_process";
import type { NextConfig } from "next";

// A stable id that changes on every deploy. It's handed to the client (as
// NEXT_PUBLIC_BUILD_ID) and used to version the service worker cache so a new
// build always supersedes the previous one's cached app shell. Prefer a commit
// SHA from the CI environment or git; fall back to a build timestamp.
function resolveBuildId(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_BUILD_ID ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    process.env.GIT_COMMIT_SHA;
  if (fromEnv) return fromEnv.slice(0, 12);
  try {
    return execSync("git rev-parse --short HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return `t${Date.now()}`;
  }
}

const buildId = resolveBuildId();

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(self), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_ID: buildId,
  },
  generateBuildId: async () => buildId,
  experimental: {
    inlineCss: true,
  },
  poweredByHeader: false,
  // iOS Safari probes these well-known root paths directly when adding a site
  // to Favourites / the Home Screen, *before* it parses the in-page
  // `<link rel="apple-touch-icon">`. Next only emits the link (pointing at the
  // generated `/apple-icon`), so without these the probes 404 and Safari falls
  // back to a generated monogram tile. Map them to the same generated icon so
  // there's one source of truth and no committed binary to keep in sync.
  async rewrites() {
    return [
      { source: "/apple-touch-icon.png", destination: "/apple-icon" },
      {
        source: "/apple-touch-icon-precomposed.png",
        destination: "/apple-icon",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      // The frame in an article embeds these routes in a same-origin iframe,
      // which the site-wide `X-Frame-Options: DENY` above would block. Browsers
      // ignore XFO entirely when CSP `frame-ancestors` is present, so this pair
      // narrows the policy to same-origin framing for /mockup/* only.
      {
        source: "/mockup/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
        ],
      },
      // Files under `public/` are served with `max-age=0` by default because
      // Next can't fingerprint their names, so the fonts get revalidated on
      // every visit. Their contents never change in place — a different font
      // means a different filename — so cache them immutably for a year.
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
