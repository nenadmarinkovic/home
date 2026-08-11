import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Providers } from "./providers";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeColorSync } from "@/components/theme-color-sync";
import { getAuthedFromCookie } from "@/lib/auth-server";
import { site } from "@/lib/site";
import { THEME_COOKIE, THEME_INIT_SCRIPT, themeColorMetas } from "@/lib/theme";
import "./globals.css";

// `viewport-fit=cover` is what makes `env(safe-area-inset-*)` resolve to real
// values and what lets iOS tint the area behind the notch and home indicator.
// Note there is deliberately no `themeColor` here: the metas are written by
// hand below so that they are guaranteed to precede the bootstrap script.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s · ${site.title}`,
  },
  description: site.description,
  authors: [{ name: site.author.name }],
  applicationName: site.title,
  appleWebApp: {
    capable: true,
    title: site.name,
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    // Next emits the standardised `mobile-web-app-capable`, which Safari only
    // learned in 17.4. Apple documents `apple-mobile-web-app-status-bar-style`
    // as having no effect without this legacy tag, so ship both.
    "apple-mobile-web-app-capable": "yes",
  },
  openGraph: {
    type: "website",
    siteName: site.title,
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    canonical: site.url,
    types: {
      "application/rss+xml": `${site.url}/rss.xml`,
    },
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-dark.svg",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: dark)",
      },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
    ],
    apple: {
      url: "/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png",
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authed = await getAuthedFromCookie();
  const themePreference = (await cookies()).get(THEME_COOKIE)?.value;
  return (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <head>
        {/*
          One un-scoped meta when the visitor has chosen a theme, two
          media-scoped ones when they are following the system. The bootstrap
          script below is still the backstop — for a first load before the
          cookie exists, for a shell served from the service worker cache, and
          for anyone whose cookies are blocked.
        */}
        {themeColorMetas(themePreference).map((meta) => (
          <meta
            key={meta.media ?? "any"}
            name="theme-color"
            media={meta.media}
            content={meta.content}
          />
        ))}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <link
          rel="preload"
          href="/fonts/HankenGrotesk-Variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Providers authed={authed}>
          <ThemeColorSync />
          <ServiceWorkerRegister />
          <div className="flex min-h-screen flex-col">
            <div className="flex flex-col flex-1 items-center justify-start bg-background pt-(--safe-top) pr-(--safe-x-right) pl-(--safe-x-left)">
              <div className="flex w-full max-w-3xl flex-1 flex-col bg-background">
                <SiteHeader />
                {children}
                <SiteFooter />
              </div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
