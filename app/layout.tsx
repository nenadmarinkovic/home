import type { Metadata, Viewport } from "next";
import { Geist, Newsreader } from "next/font/google";
import { Providers } from "./providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeColorSync } from "@/components/theme-color-sync";
import { getAuthedFromCookie } from "@/lib/auth-server";
import { site } from "@/lib/site";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f3f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1115" },
  ],
};

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
      className={`${geist.variable} ${newsreader.variable} antialiased`}
    >
      <body>
        <Providers authed={authed}>
          <ThemeColorSync />
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
