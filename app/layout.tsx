import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "./providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeColorSync } from "@/components/theme-color-sync";
import { site } from "@/lib/site";
import "./globals.css";

const sourceSerif = localFont({
  variable: "--font-source-serif",
  display: "swap",
  src: [
    {
      path: "./fonts/source-serif-4-latin.woff2",
      weight: "200 900",
      style: "normal",
    },
    {
      path: "./fonts/source-serif-4-italic-latin.woff2",
      weight: "200 900",
      style: "italic",
    },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s · ${site.title}`,
  },
  description: site.description,
  authors: [{ name: site.author.name }],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sourceSerif.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||((t==='system'||!t)&&matchMedia('(prefers-color-scheme: dark)').matches);var c=d?'#0c1115':'#f7f3f3';var m=document.createElement('meta');m.name='theme-color';m.content=c;document.head.appendChild(m);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <ThemeColorSync />
          <div className="flex flex-col flex-1 items-center justify-start bg-background px-6">
            <div className="flex w-full max-w-2xl flex-1 flex-col bg-background">
              <SiteHeader />
              {children}
              <SiteFooter />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
