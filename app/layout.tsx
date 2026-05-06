import type { Metadata, Viewport } from "next";
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
    title: site.title,
    description: site.description,
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  alternates: {
    canonical: site.url,
    types: {
      "application/rss+xml": `${site.url}/rss.xml`,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f3f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1115" },
  ],
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
