import { execSync } from "node:child_process";
import type { NextConfig } from "next";

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

const canonicalHost = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://nenadmarinkovic.com",
).host;

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
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: `www.${canonicalHost}` }],
        destination: `https://${canonicalHost}/:path*`,
        permanent: true,
      },
      { source: "/blog", destination: "/writing", permanent: true },
      {
        source: "/blog/:slug*",
        destination: "/writing/:slug*",
        permanent: true,
      },
      { source: "/feed", destination: "/rss.xml", permanent: true },
      { source: "/about", destination: "/", permanent: true },
    ];
  },
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
