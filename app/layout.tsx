import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeColorSync } from "@/components/theme-color-sync";
import { getAuthedFromCookie } from "@/lib/auth-server";
import { site } from "@/lib/site";
import { THEME_COLORS, THEME_INIT_SCRIPT } from "@/lib/theme";
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
    // `default` leaves the status bar strip to iOS, which draws it from the
    // system appearance during a standalone launch — a black strip on a light
    // app, unreachable from the page because there is no document yet.
    // `black-translucent` extends the web view under it so the strip is ours:
    // the launch screen's `background_color` covers it, then `--background`
    // does (see the mask in <body>). The cost is white status-bar glyphs.
    statusBarStyle: "black-translucent",
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
  return (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <head>
        {/*
          One un-scoped meta, always light, rewritten by the script below before
          first paint. Deliberately not media-scoped: a dark-media meta matches
          on a dark-appearance phone even when the app is in light mode, and iOS
          tints the notch from it mid-parse.
        */}
        <meta name="theme-color" content={THEME_COLORS.light} />
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
          {/*
            Under `black-translucent` the web view runs to the top of the
            screen, so scrolled content would pass behind the clock. This masks
            the strip in the app's own colour. Zero height off iOS, and on
            Safari 26 it is exactly what the tint gets sampled from.
          */}
          <div
            aria-hidden
            className="pointer-events-none fixed inset-x-0 top-0 z-50 h-(--safe-top) bg-background"
          />
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
