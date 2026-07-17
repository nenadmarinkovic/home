import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
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

const THEME_COLOR_SCRIPT = `(function(){try{
var t=localStorage.getItem("theme");
if(t!=="dark"&&t!=="light"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}
var color=t==="dark"?"#000000":"#fafafa";
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
          href="/fonts/AlbertSans-Variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_COLOR_SCRIPT }} />
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
