import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import { Providers } from "./providers";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeColorSync } from "@/components/theme-color-sync";
import { getAuthedFromCookie } from "@/lib/auth-server";
import { site } from "@/lib/site";
import "./globals.css";

const sans = localFont({
  src: "./fonts/google-sans-flex.woff2",
  variable: "--font-sans",
  weight: "1 1000",
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],
});

// The serif is a secondary, decorative face (logo + a few headings). On mobile
// `display: "swap"` makes it flash from the fallback to Newsreader once it
// loads — most visible against the sans body text. "optional" gives it a tiny
// block window and then never swaps mid-load, so there's no flicker; the
// metric-matched fallback keeps layout from shifting either way.
const newsreader = localFont({
  src: [
    {
      path: "./fonts/newsreader.woff2",
      weight: "200 800",
      style: "normal",
    },
    {
      path: "./fonts/newsreader-italic.woff2",
      weight: "200 800",
      style: "italic",
    },
  ],
  variable: "--font-serif",
  display: "optional",
  adjustFontFallback: "Times New Roman",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export async function generateViewport(): Promise<Viewport> {
  // Read the in-app theme cookie (set by ThemeColorSync). If present, emit a
  // single theme-color matching the user's pick — prevents the iOS notch from
  // flashing the OS-default color when in-app theme differs from system theme.
  const pref = (await cookies()).get("theme-color")?.value;
  const base: Viewport = {
    viewportFit: "cover",
  };
  if (pref === "dark") return { ...base, themeColor: "#0c1115" };
  if (pref === "light") return { ...base, themeColor: "#f5f4f0" };
  return {
    ...base,
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#f5f4f0" },
      { media: "(prefers-color-scheme: dark)", color: "#0c1115" },
    ],
  };
}

// Set the iOS notch (theme-color) to the live client theme synchronously,
// before first paint, on every full document load. This is the anti-flicker
// counterpart to generateViewport's cookie: generateViewport gets the first
// *server* byte right, but the service worker caches each page's HTML with
// whatever theme-color was baked in at cache time (see public/sw.js). When the
// user later switches theme — or launches the PWA against a stale cached "/" —
// that cached HTML paints the old notch color, and ThemeColorSync (a post-paint
// effect) corrects it a frame later; iOS animates theme-color changes, so the
// notch visibly fades from the stale color to the right one.
//
// Running this blocking script first reads the same resolved theme next-themes
// uses (localStorage "theme", falling back to the OS preference) and forces a
// matching theme-color before anything paints, so the cached/baked color is
// never shown. ThemeColorSync's later update is then a no-op (same color -> no
// fade). No network dependency, so it works offline too.
//
// CRITICAL: this runs *before* React hydrates, so it must NOT add or remove any
// node in <head> — Next renders the theme-color metas inside its React tree, and
// changing that tree's structure pre-hydration corrupts hydration (the mobile
// menu won't open and links stop responding until a hard refresh; see the same
// warning in ThemeColorSync). So instead of inserting a fresh meta, it only
// rewrites attributes on the metas Next already emitted: it points the first one
// at the resolved color and marks it active, and deactivates the rest via
// `media="not all"`. React does not reconcile `media` (see ThemeColorSync), and
// hydration doesn't diff attribute values, so the head's node structure stays
// identical to the server markup and hydration is left intact.
const THEME_COLOR_SCRIPT = `(function(){try{
var t=localStorage.getItem("theme");
if(t!=="dark"&&t!=="light"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}
var color=t==="dark"?"#0c1115":"#f5f4f0";
var metas=document.querySelectorAll('meta[name="theme-color"]');
for(var i=0;i<metas.length;i++){
if(i===0){metas[i].setAttribute("content",color);metas[i].setAttribute("media","all");}
else{metas[i].setAttribute("media","not all");}
}
}catch(e){}})();`;

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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authed = await getAuthedFromCookie();
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${newsreader.variable} antialiased`}
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_COLOR_SCRIPT }} />
        <Providers authed={authed}>
          <ThemeColorSync />
          <ServiceWorkerRegister />
          <div className="flex min-h-screen flex-col">
            <div className="flex flex-col flex-1 items-center justify-start bg-background px-6">
              <div className="flex w-full max-w-2xl flex-1 flex-col bg-background">
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
