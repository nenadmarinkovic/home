import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import Script from "next/script";
import { Providers } from "./providers";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeColorSync } from "@/components/theme-color-sync";
import { getAuthedFromCookie } from "@/lib/auth-server";
import { site } from "@/lib/site";
import "./globals.css";

export async function generateViewport(): Promise<Viewport> {
  // Read the in-app theme cookie (set by ThemeColorSync). If present, emit a
  // single theme-color matching the user's pick — prevents the iOS notch from
  // flashing the OS-default color when in-app theme differs from system theme.
  const pref = (await cookies()).get("theme-color")?.value;
  const base: Viewport = {
    viewportFit: "cover",
  };
  if (pref === "dark") return { ...base, themeColor: "#000000" };
  if (pref === "light") return { ...base, themeColor: "#fafafa" };
  return {
    ...base,
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#fafafa" },
      { media: "(prefers-color-scheme: dark)", color: "#000000" },
    ],
  };
}

// next/script puts this in <head>, which can run before the theme-color metas
// are parsed — hence the DOMContentLoaded retry. It only ever edits attributes:
// inserting a node here would desync React's hydration of the document.
//
// It also writes *nothing* when the markup already resolves to the right color,
// which is the normal case. iOS animates the status bar — the strip above the
// header — on every theme-color change, so a redundant write shows up as a
// color fade each time the PWA is opened. Since the retry path runs after first
// paint, that fade was visible on essentially every launch.
const THEME_COLOR_SCRIPT = `(function(){function a(){try{
var metas=document.querySelectorAll('meta[name="theme-color"]');
if(!metas.length)return false;
var s=localStorage.getItem("theme");
var pick=s==="dark"||s==="light";
var t=pick?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");
var color=t==="dark"?"#000000":"#fafafa";
var active=null;
for(var i=0;i<metas.length;i++){
var m=metas[i].getAttribute("media");
if(!m||window.matchMedia(m).matches){active=metas[i];break;}
}
if(!active)return true;
if(active.getAttribute("content")!==color)active.setAttribute("content",color);
if(pick){for(var j=0;j<metas.length;j++){
if(metas[j]!==active&&metas[j].getAttribute("media")!=="not all")metas[j].setAttribute("media","not all");
}}
return true;
}catch(e){return true;}}
if(!a())document.addEventListener("DOMContentLoaded",a);})();`;

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
        <link
          rel="preload"
          href="/fonts/HankenGrotesk-Variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Script
          id="theme-color-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_COLOR_SCRIPT }}
        />
        <Providers authed={authed}>
          <ThemeColorSync />
          <ServiceWorkerRegister />
          <div className="flex min-h-screen flex-col">
            <div className="flex flex-col flex-1 items-center justify-start bg-background px-6">
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
